/*eslint strict:0 */
'use strict';
let request = require('request');
let inquirer = require('inquirer');
let async = require('async');
let _ = require('lodash');
let gutil = require('gulp-util');
let ProgressBar = require('progress');
let bar = null;
let configTemplate = require('config-template');
let fs = require('fs');
let fingerprint = require('ssh-fingerprint');
let path = require('path');
let SSH = require('simple-ssh');
let clipboard = require('copy-paste');

const API_ROOT = 'https://api.digitalocean.com/v2/';

function getAllImages(key, data, cb) {
	if(data && !data.links.pages.next) {
		cb(null, data.images);
	}
	else {
		request(
			{
				method: 'GET',
				url: data ? data.links.pages.next : API_ROOT+'images',
				json: true,
				headers: {
					Authorization: 'Bearer ' + key
				}
			},
			(error, response, nextData) => {
				let resultset = data ? data.images : [];
				bar.tick(1);
				getAllImages(key, nextData, (err, images) => {
					cb(err, resultset.concat(images));
				});
			}
		);
	}
}

module.exports = function(appName, adapterConfig, appConfigTemplate) {
	function getDroplet(id, cb) {
		request(
			{
				method: 'GET',
				url: API_ROOT+'droplets/'+id,
				json: true,
				headers: {
					Authorization: 'Bearer ' + adapterConfig.key
				}
			},
			(err, response, body) => {
				cb(err, body ? body.droplet : null);
			}
		);
	}

	let builder = {
		getPublicKey: function(cb) {
			let sshPath = path.join(process.env.HOME || process.env.USERPROFILE, '.ssh', 'id_rsa.pub');
			fs.readFile(sshPath, cb);
		},
		getPrivateKey: function(cb) {
			let sshPath = path.join(process.env.HOME || process.env.USERPROFILE, '.ssh', 'id_rsa');
			fs.readFile(sshPath, cb);
		},
		getDigitalOceanKey: function(cb, results) {
			let fp = fingerprint(results.publicKey.toString());
			let sshKey = _.findWhere(results.sshKeys, {fingerprint: fp});
			if(sshKey) {
				return cb(null, sshKey);
			}
			request(
				{
					method: 'POST',
					url: 'https://api.digitalocean.com/v2/account/keys',
					json: true,
					headers: {
						Authorization: 'Bearer ' + adapterConfig.key
					},
					body: {
						name: results.fingerprint,
						public_key: results.publicKey.toString()
					}
				},
				(error, response, body) => {
					cb(error, body ? body.ssh_key : null);
				}
			);
		},
		listDroplets: function(cb) {
			request(
				{
					method: 'GET',
					url: API_ROOT+'droplets',
					json: true,
					headers: {
						Authorization: 'Bearer ' + adapterConfig.key
					}
				},
				(error, response, body) => {
					bar.tick(1);
					cb(error, body ? body.droplets.filter((drop) => drop.status === 'active') : null);
				}
			);
		},
		listImages: function(cb) {
			getAllImages(adapterConfig.key, null, (err, images) => {
				if(!err && images && Array.isArray(images)) {
					return cb(null, _.sortBy(images, (image) => {
						if(image.public) {
							return 'Z'+image.distribution+' '+image.name;
						}
						return 'A'+image.distribution+' '+image.name;
					}));
				}
				return cb(err, images);
			});
		},
		listSshKeys: function(cb) {
			request(
				{
					method: 'GET',
					url: API_ROOT+'account/keys',
					json: true,
					headers: {
						Authorization: 'Bearer ' + adapterConfig.key
					}
				},
				(error, response, body) => {
					cb(error, body ? body.ssh_keys : null);
				}
			);
		},
		serverPrompt: function(cb, results) {
			let imageChoices = results.images.map((image) => {
				return {name: (image.public ? '' : '*private* ')+image.distribution+' '+image.name, value: image.slug || image.id};
			});
			imageChoices.push(new inquirer.Separator());

			let dropletChoices = results.droplets.map((drop) => {
				return {name: drop.name, value: drop.id};
			});
			dropletChoices.unshift('new droplet');
			dropletChoices.push(new inquirer.Separator());

			inquirer.prompt(
				[
					{
						type: 'list',
						name: 'droplet',
						message: 'Where should we deploy this app?',
						choices:  dropletChoices
					},
					{
						type: 'input',
						name: 'newDropletName',
						message: 'What should the new droplet be called?',
						default: appName || '',
						when: (answers) => answers.droplet === 'new droplet',
						validate: (input) => {
							if(!input) {
								return 'A droplet name is required.';
							}
							return true;
						}
					},
					{
						type: 'list',
						name: 'image',
						message: 'Which image should be used?',
						choices:  imageChoices,
						when: (answers) => answers.droplet === 'new droplet'
					},
					{
						type: 'list',
						name: 'region',
						message: 'Which region should be used for the new droplet?',
						choices:  (answers) => {
							if(_.isString(answers.image)) {
								return _.findWhere(results.images, {slug: answers.image}).regions;
							}
							else {
								return _.findWhere(results.images, {id: answers.image}).regions;
							}
						},
						when: (answers) => answers.droplet === 'new droplet'
					},
					{
						type: 'input',
						name: 'projectName',
						message: 'What is the name of this project?',
						default: appName || '',
						validate: (input) => {
							if(!input) {
								return 'A project name is required.';
							}
							return true;
						}
					}
				],
				function(answers) {
					cb(null, answers);
				}
			);
		},
		droplet: function(cb, results) {
			if(results.serverConfig.droplet !== 'new droplet' || !results.serverConfig.newDropletName) {
				let droplet = _.findWhere(results.droplets, {id: results.serverConfig.droplet});
				if(!droplet) {
					return cb('There was a problem finding the droplet that you chose.');
				}
				else {
					return cb(null, droplet);
				}
			}
			request(
				{
					method: 'POST',
					url: 'https://api.digitalocean.com/v2/droplets',
					json: true,
					headers: {
						Authorization: 'Bearer ' + adapterConfig.key
					},
					body: {
						name: results.serverConfig.newDropletName,
						region: results.serverConfig.region,
						size: '1gb',
						image: results.serverConfig.image,
						ssh_keys: [results.sshKey.id]
					}
				},
				(error, response, body) => {
					// gutil.log(gutil.colors.green('Creating droplet:'), 'Your droplet is in the process of being created. In the mean time,');
					// gutil.log(gutil.colors.green('Creating droplet:'), 'please fill out this configuration information for your app...');
					cb(error, body ? body.droplet : null);
				}
			);
		},
		configPrompt: function(cb, results) {
			configTemplate(appConfigTemplate)
			.then((config) => {
				cb(null, config);
			})
			.catch(cb);
		},
		wait: function(cb, results) {
			const MAX_WAIT = 5*60*1000;
			let droplet = results.droplet;
			let dropletCreationDate = new Date(results.droplet.created_at);
			
			gutil.log(gutil.colors.green('Creating droplet...'), 'Your droplet is in the process of being created. It will usually take a minute, but can take up to 5 minutes.');

			let progress = new ProgressBar('Waiting for droplet to be created [:bar] :percent :elapsed', {
				complete: '=',
				incomplete: ' ',
				width: 20,
				total: MAX_WAIT
			});

			let intervalId = setInterval(() => {
				let timeDiff = (new Date()).getTime() - dropletCreationDate.getTime();
				progress.update(timeDiff/MAX_WAIT);
			}, 2);

			async.whilst(
				function() {
					return droplet.status !== 'active';
				},
				function(checkCb) {
					getDroplet(results.droplet.id, (err, d) => {
						if(err) {
							return checkCb(err);
						}

						let timeDiff = (new Date()).getTime() - dropletCreationDate.getTime();
						if(timeDiff > MAX_WAIT) {
							return checkCb('Droplet creation timed out.');
						}

						droplet = d;

						if(droplet.status === 'active') {
							checkCb();
						}
						else {
							setTimeout(checkCb, 5000);
						}
					});
				},
				function(err) {
					clearInterval(intervalId);
					progress.update(1);
					cb(err);
				}
			);
		},
		setupServer: function(cb, r) {
			// for testing
			var results = {
				droplet: {
					networks: {
						v4: [
							{
								type: 'public',
								ip_address: '104.236.44.29'
							}
						],
						v6: []
					}
				},
				privateKey: r.privateKey,
				serverConfig: {
					projectName: 'test-app'
				}
			};
			let pjson = {
				repository: {
					url: 'git@bitbucket.org:alarner/impact-web.git'
				}
			};

			let ip = null;
			let publicV4s = results.droplet.networks.v4.filter((network) => network.type === 'public');
			let publicV6s = results.droplet.networks.v6.filter((network) => network.type === 'public');
			if(publicV4s.length) {
				ip = publicV4s[0].ip_address;
			}
			else if(publicV6s.length) {
				ip = publicV6s[0].ip_address;
			}
			else {
				return cb('No network address found for droplet.');
			}

			let options = {
				sshConfig: {
					host: ip,
					user: 'root',
					key: results.privateKey.toString()
				},
				appPath: '/usr/share/nginx/apps/'+results.serverConfig.projectName,
				results: results,
				pjson: pjson
			}

			async.auto({
				sshKey: [configurer.getSshKey.bind(options)],
				cloneApp: ['sshKey', configurer.cloneApp.bind(options)],
				// npmInstall: ['cloneApp', configurer.npmInstall],
				// putNginxConf: [configurer.putNginxConf],
				// restartNginx: ['putNginxConf', configurer.restartNginx],
				// putSystemdConf: [configurer.putSystemdConf],
				// startApp: ['putSystemdConf', 'npmInstall', configurer.startApp]
			});
			// ssh.pipe(process.stdout);
			// ssh.pipe(process.stderr);
			// ssh.write('cat ~/.ssh/id_rsa.pub');
			// ssh.write('mkdir -p '+appPath);
			// ssh.write('git clone '+pjson.repository.url+' '+appPath);
			// Things to do:
			// set up app code
			//	- generate ssh key
			//	- ask user to add read only verification for ssh key
			//	- git clone app into correct directory
			//	- run npm install
			// set up nginx config
			// restart nginx server
			// set up systemd config
			// start app via systemd
		}
	};

	let configurer = {
		getSshKey: function(cb) {
			var ssh = new SSH(this.sshConfig);
			let err = '';
			let out = '';
			ssh.exec('cat ~/.ssh/id_rsa.pub', {
				out: (stdout) => {
					out += stdout;
				},
				err: (stderr) => {
					err += stderr;
				},
				exit: (code) => {
					if(code === 0 && out) {
						return cb(null, out.trim());
					}
					out = '';
					err = '';
					ssh.exec('ssh-keygen -t rsa -b 4096 -C "'+this.results.serverConfig.projectName+'" -f ~/.ssh/id_rsa -N \'\'', {
						out: (stdout) => {
							out += stdout;
						},
						err: (stderr) => {
							err += stderr;
						},
						exit: (code) => {
							if(code !== 0) {
								return cb(err);
							}

							out = '';
							err = '';
							ssh.exec('cat ~/.ssh/id_rsa.pub', {
								out: (stdout) => {
									out += stdout;
								},
								err: (stderr) => {
									err += stderr;
								},
								exit: (code) => {
									if(code !== 0) {
										return cb(err);
									}

									cb(null, out.trim());
								}
							});
							return false;
						}
					});
					return false;
				}
			}).start();
		},

		cloneApp: function(cb, results) {
			clipboard.copy(results.sshKey, (err, data) => {
				gutil.log(gutil.colors.green('Retreived server SSH key'), 'The server SSH key has been retrieved. Please add access for the following public key to your repository.');
				gutil.log(gutil.colors.yellow('The SSH key has been copied to your clipboard.'));
				gutil.log(gutil.colors.cyan('Repo:'), this.pjson.repository.url);
				gutil.log(gutil.colors.cyan('SSH Key:'));
				console.log(results.sshKey);
			});
		}
	};

	return new Promise(function(resolve, reject) {
		bar = new ProgressBar('Fetching Digital Ocean info [:bar] :percent :etas', {
			complete: '=',
			incomplete: ' ',
			width: 20,
			total: 4
		});
		async.auto(
			{
				privateKey: [builder.getPrivateKey],
				// publicKey: [builder.getPublicKey],
				// droplets: [builder.listDroplets],
				// images: [builder.listImages],
				// sshKeys: [builder.listSshKeys],
				// sshKey: ['sshKeys', 'publicKey', builder.getDigitalOceanKey],
				// serverConfig: ['droplets', 'images', builder.serverPrompt],
				// droplet: ['serverConfig', 'sshKey', builder.droplet],
				// appConfig: ['droplet', builder.configPrompt],
				// wait: ['appConfig', builder.wait],
				setup: [/*'wait', */'privateKey', builder.setupServer]
			},
			function(err, data) {
				console.log('async finish');
				if(err) {
					console.log(err);
					reject(err);
				}
				else {
					resolve(data);
				}
			}
		);
	});
};