const UserModel = require('../../models/User');
const Howhap = require('howhap');
const config = require('../config');
module.exports = function(email, t) {
	return new Promise((resolve, reject) => {
		UserModel
		.forge({email: email})
		.fetch({transacting: t})
		.then(function(u) {
			if(u) {
				reject(new Howhap(
					config.errors.auth.EMAIL_EXISTS
				));
			}
			else {
				resolve();
			}
		})
		.catch(err => {
			reject(new Howhap(
				config.errors.auth.UNKNOWN,
				{ message: err.toString() }
			));
		});
	});
};