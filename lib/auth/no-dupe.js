let UserModel = require('../../models/User');
let Howhap = require('howhap');
let config = require('../config');
module.exports = function(email, t) {
	return new Promise((resolve, reject) => {
		UserModel
		.forge({email: email})
		.fetch()
		.then(function(u) {
			if(u) {
				console.log('ERR 1');
				reject(new Howhap(
					config.errors.auth.EMAIL_EXISTS
				));
			}
			else {
				resolve();
			}
		})
		.catch(err => {
			console.log('ERR 2');
			reject(new Howhap(
				config.errors.auth.UNKNOWN,
				{message: err.toString()}
			));
		});
	});
};