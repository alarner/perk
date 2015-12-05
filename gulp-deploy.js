'use strict';
let request = require('request');
let gutil = require('gulp-util');
let inquirer = require('inquirer');
let config = require('./lib/config');
let pjson = require('./package.json');
let async = require('async');
let _ = require('lodash');

module.exports = function() {
	let env = process.argv.length >= 4 ? process.argv[3].substr(6) : 'default';
	if(!config.deploy || !config.deploy.hasOwnProperty(env)) {
		gutil.log(gutil.colors.red('Could not find environment'), gutil.colors.yellow(env), gutil.colors.red('in config file'));
		gutil.beep();
		return;
	}
	else {
		gutil.log(gutil.colors.green('Deploying to'), env);
	}

	let deployConfig = config.deploy[env];
	if(deployConfig.type.toLowerCase() === 'digitalocean') {
		function getAllImages(data, cb) {
			if(!data.links.pages.next) {
				cb(null, data.images);
			}
			else {
				request(
					{
						method: 'GET',
						url: data.links.pages.next,
						json: true,
						headers: {
							Authorization: 'Bearer ' + deployConfig.key
						}
					},
					(error, response, nextData) => {
						getAllImages(nextData, (err, images) => {
							cb(err, data.images.concat(images));
						});
					}
				);
			}
		}

		return new Promise(function(resolve, reject) {
			async.auto(
				{
					droplets: [(cb) => {
						request(
							{
								method: 'GET',
								url: 'https://api.digitalocean.com/v2/droplets',
								json: true,
								headers: {
									Authorization: 'Bearer ' + deployConfig.key
								}
							},
							(error, response, body) => {
								cb(error, body ? body.droplets.filter((drop) => drop.status === 'active') : null);
							}
						);
					}],
					images: [(cb) => {
						request(
							{
								method: 'GET',
								url: 'https://api.digitalocean.com/v2/images',
								json: true,
								headers: {
									Authorization: 'Bearer ' + deployConfig.key
								}
							},
							(error, response, body) => {
								getAllImages(body, (err, images) => {
									if(!err && images && Array.isArray(images)) {
										// Show private images first.
										return cb(null, _.sortBy(images, (image) => {
											if(image.public) {
												return 'Z'+image.distribution+' '+image.name;
											}
											return 'A'+image.distribution+' '+image.name;
										}));
									}
									return cb(err, body);
								});
							}
						);
					}],
					prompt: ['droplets', 'images', (cb, results) => {
						// console.log(results.images);
						let imageChoices = results.images.map((image) => {
							return {name: (image.public ? '' : '*private* ')+image.distribution+' '+image.name, value: image.id};
						});
						imageChoices.push(new inquirer.Separator());

						let dropletChoices = results.droplets.map((drop) => drop.name);
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
									when: (answers) => answers.droplet === 'new droplet'
								},
								{
									type: 'list',
									name: 'image',
									message: 'Which image should be used?',
									choices:  imageChoices,
									when: (answers) => answers.droplet === 'new droplet'
								},
								{
									type: 'input',
									name: 'projectName',
									message: 'What is the name of this project?',
									default: pjson.name || ''
								}
							],
							function( answers ) {
								console.log(answers);
								// Use user feedback for... whatever!!
							}
						);
					}]
				},
				(err, data) => {
					if(err) {
						reject(err);
					}
					else {
						resolve(data);
					}
				}
			);
		});
	}
	else {
		gutil.log(gutil.colors.red('Could not deployment adapter for type'), gutil.colors.yellow(deployConfig.type));
		gutil.beep();
		return;
	}
};