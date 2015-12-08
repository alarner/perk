// 'use strict';
// let request = require('request');
// let gutil = require('gulp-util');
// let inquirer = require('inquirer');
// let async = require('async');
// let _ = require('lodash');

// module.exports = function() {
// 	let env = process.argv.length >= 4 ? process.argv[3].substr(6) : 'default';
// 	if(!config.deploy || !config.deploy.hasOwnProperty(env)) {
// 		gutil.log(gutil.colors.red('Could not find environment'), gutil.colors.yellow(env), gutil.colors.red('in config file'));
// 		gutil.beep();
// 		return;
// 	}
// 	else {
// 		gutil.log(gutil.colors.green('Deploying to'), env);
// 	}

// 	let deployConfig = config.deploy[env];
// 	if(deployConfig.type.toLowerCase() === 'digitalocean') {
// 		function getAllImages(data, cb) {
// 			if(!data.links.pages.next) {
// 				cb(null, data.images);
// 			}
// 			else {
// 				request(
// 					{
// 						method: 'GET',
// 						url: data.links.pages.next,
// 						json: true,
// 						headers: {
// 							Authorization: 'Bearer ' + deployConfig.key
// 						}
// 					},
// 					(error, response, nextData) => {
// 						getAllImages(nextData, (err, images) => {
// 							cb(err, data.images.concat(images));
// 						});
// 					}
// 				);
// 			}
// 		}

// 		return new Promise(function(resolve, reject) {
// 			async.auto(
// 				{
// 					droplets: [(cb) => {
// 						gutil.log(gutil.colors.green('Start'), 'loading available droplets...');
// 						request(
// 							{
// 								method: 'GET',
// 								url: 'https://api.digitalocean.com/v2/droplets',
// 								json: true,
// 								headers: {
// 									Authorization: 'Bearer ' + deployConfig.key
// 								}
// 							},
// 							(error, response, body) => {
// 								gutil.log(gutil.colors.green('Finish'), 'loading available droplets...');
// 								cb(error, body ? body.droplets.filter((drop) => drop.status === 'active') : null);
// 							}
// 						);
// 					}],
// 					images: [(cb) => {
// 						gutil.log(gutil.colors.green('Start'), 'loading available images...');
// 						request(
// 							{
// 								method: 'GET',
// 								url: 'https://api.digitalocean.com/v2/images',
// 								json: true,
// 								headers: {
// 									Authorization: 'Bearer ' + deployConfig.key
// 								}
// 							},
// 							(error, response, body) => {
// 								if(error || !body) {
// 									return cb(error);
// 								}
// 								getAllImages(body, (err, images) => {
// 									gutil.log(gutil.colors.green('Finish'), 'loading available images...');
// 									if(!err && images && Array.isArray(images)) {
// 										// Show private images first.
// 										return cb(null, _.sortBy(images, (image) => {
// 											if(image.public) {
// 												return 'Z'+image.distribution+' '+image.name;
// 											}
// 											return 'A'+image.distribution+' '+image.name;
// 										}));
// 									}
// 									return cb(err, body);
// 								});
// 							}
// 						);
// 					}],
// 					prompt: ['droplets', 'images', (cb, results) => {
// 						let imageChoices = results.images.map((image) => {
// 							return {name: (image.public ? '' : '*private* ')+image.distribution+' '+image.name, value: image.slug || image.id};
// 						});
// 						imageChoices.push(new inquirer.Separator());

// 						let dropletChoices = results.droplets.map((drop) => drop.name);
// 						dropletChoices.unshift('new droplet');
// 						dropletChoices.push(new inquirer.Separator());

// 						inquirer.prompt(
// 							[
// 								{
// 									type: 'list',
// 									name: 'droplet',
// 									message: 'Where should we deploy this app?',
// 									choices:  dropletChoices
// 								},
// 								{
// 									type: 'input',
// 									name: 'newDropletName',
// 									message: 'What should the new droplet be called?',
// 									when: (answers) => answers.droplet === 'new droplet',
// 									validate: (input) => {
// 										if(!input) {
// 											return 'A droplet name is required.';
// 										}
// 										return true;
// 									}
// 								},
// 								{
// 									type: 'list',
// 									name: 'image',
// 									message: 'Which image should be used?',
// 									choices:  imageChoices,
// 									when: (answers) => answers.droplet === 'new droplet'
// 								},
// 								{
// 									type: 'list',
// 									name: 'region',
// 									message: 'Which region should be used for the new droplet?',
// 									choices:  (answers) => {
// 										console.log(answers);
// 										if(_.isString(answers.image)) {
// 											return _.findWhere(results.images, {slug: answers.image}).regions;
// 										}
// 										else {
// 											return _.findWhere(results.images, {id: answers.image}).regions;
// 										}
// 									},
// 									when: (answers) => answers.droplet === 'new droplet'
// 								},
// 								{
// 									type: 'input',
// 									name: 'projectName',
// 									message: 'What is the name of this project?',
// 									default: pjson.name || '',
// 									validate: (input) => {
// 										if(!input) {
// 											return 'A project name is required.';
// 										}
// 										return true;
// 									}
// 								}
// 							],
// 							function(answers) {
// 								cb(null, answers);
// 							}
// 						);
// 					}],
// 					create: ['prompt', (cb, results) => {
// 						if(results.prompt.droplet !== 'new droplet' || !results.prompt.newDropletName) {
// 							return cb();
// 						}
// 						gutil.log(gutil.colors.green('Start'), 'creating droplet...');
// 						console.log({
// 							name: results.prompt.newDropletName,
// 							region: results.prompt.region,
// 							size: '512mb',
// 							image: results.prompt.image
// 						});
// 						request(
// 							{
// 								method: 'POST',
// 								url: 'https://api.digitalocean.com/v2/droplets',
// 								json: true,
// 								headers: {
// 									Authorization: 'Bearer ' + deployConfig.key
// 								},
// 								body: {
// 									name: results.prompt.newDropletName,
// 									region: results.prompt.region,
// 									size: '1gb',
// 									image: results.prompt.image
// 								}
// 							},
// 							(error, response, body) => {
// 								gutil.log(gutil.colors.green('Finish'), 'creating droplet...');
// 								console.log(error, body);
// 								cb(error, body);
// 							}
// 						);
// 					}]
// 				},
// 				(err, data) => {
// 					if(err) {
// 						reject(err);
// 					}
// 					else {
// 						resolve(data);
// 					}
// 				}
// 			);
// 		});
// 	}
// 	else {
// 		gutil.log(gutil.colors.red('Could not deployment adapter for type'), gutil.colors.yellow(deployConfig.type));
// 		gutil.beep();
// 		return;
// 	}
// };