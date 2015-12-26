/*eslint strict:0 */
'use strict';
let fs = require('fs');
let SSH = require('simple-ssh');
let path = require('path');

let SHHH = function(options) {
	this.ssh = new SSH(options);
	this.exec = function(command) {
		console.log('exec', command);
		return new Promise((resolve, reject) => {
			let out = '';
			let err = '';
			this.ssh.exec(command, {
				out: (stdout) => {
					out += stdout;
				},
				err: (stderr) => {
					err += stderr;
				},
				exit: (code) => {
					if(code === 0) {
						resolve(out.trim());
					}
					else {
						reject({
							code: code,
							error: err.trim()
						});
					}
				}
			})
			.on('error', (err) => {
				if(typeof err !== 'string') {
					err = err.toString();
				}
				reject({
					code: -1,
					error: err.trim()
				});
			})
			.start();
		});
	};
};


module.exports = function(user, host) {
	if(typeof user !== 'string') {
		throw 'User must be a string';
	}
	if(typeof host !== 'string') {
		throw 'Host must be a string';
	}
	this.privateKey = null;
	this.execute = function(name) {
		console.log('execute', name);
		if(!this.hasOwnProperty(name)) {
			return new Promise((resolve, reject) => reject('No method "'+name+'"'));
		}
		return this.getLocalPrivateKey()
		.then((privateKey) => {
			let ssh = new SHHH({
				host: host,
				user: user,
				key: privateKey
			});
			let args = Array.prototype.slice.call(arguments, 1);
			args.unshift(ssh);
			return this[name].apply(this, args);
		});
	};

	this.getLocalPrivateKey = function(ssh) {
		return new Promise((resolve, reject) => {
			if(this.privateKey) {
				return resolve(this.privateKey);
			}
			else {
				let sshPath = path.join(process.env.HOME || process.env.USERPROFILE, '.ssh', 'id_rsa');
				fs.readFile(sshPath, (err, key) => {
					if(err) {
						return reject(err);
					}
					else {
						this.privateKey = key.toString();
						return resolve(this.privateKey);
					}
				});
			}
		});
	};

	this.getSshKey = function(ssh) {
		return ssh.exec('cat ~/.ssh/id_rsa.pub');
	};

	this.createSshKey = function(ssh, name) {
		return ssh.exec('ssh-keygen -t rsa -b 4096 -C "'+name+'" -f ~/.ssh/id_rsa -N \'\'');
	};

	this.upsertSshKey = function(ssh, name) {
		return this.execute('getSshKey')
		.catch((err) => {
			if(err.error.indexOf('No such file or directory') >= -1) {
				return this.execute('createSshKey', name)
					.then(() => this.execute('getSshKey'));
			}
			else {
				throw err;
			}
		});
	};

	this.mkdirp = function(ssh, destination) {
		return ssh.exec('mkdir -p '+destination);
	};

	this.npmInstall = function(ssh, destination) {
		return ssh.exec('cd '+destination+' && npm install');
	};

	this.gitClone = function(ssh, destination, url) {
		return ssh.exec('git clone '+url+' '+destination);
	};

	this.gitListTags = function(ssh, destination) {
		return this.execute('gitRemoteUpdate', destination)
			.then(() => ssh.exec('cd '+destination+' && git tag'))
			.then((tags) => tags.split('\n'));
	};

	this.gitRemoteUpdate = function(ssh, destination) {
		return ssh.exec('cd '+destination+' && git remote update');
	};

	this.gitCheckout = function(ssh, destination, entity) {
		return ssh.exec('cd '+destination+' && git checkout '+entity);
	};

	this.gitLatestTag = function(ssh, destination, url) {
		return this.execute('gitClone', destination, url)
		.catch((err) => {
			if(err.error.indexOf('not an empty directory') >= 0) {
				return this.execute('gitListTags', destination)
				.then((tags) => this.execute('gitCheckout', destination, tags.pop()));
			}
			else {
				throw err;
			}
		});
	};
};