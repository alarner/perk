const UserModel = require('../../models/User');
const Howhap = require('howhap');
const config = require('../config');
module.exports = function(email, t) {
	return new Promise((resolve, reject) => {
		const forgeData = {};
		forgeData[config.auth.columns.user.email] = email;
		UserModel
		.forge(forgeData)
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
