let Howhap = require('howhap');
let config = require('../config');

module.exports = function(user, login) {
	return new Promise(function(resolve, reject) {
		login(user, err => {
			if(err) {
				return reject(new Howhap(
					config.errors.auth.UNKNOWN,
					{ message: err.toString() }
				));
			}
			resolve(user);
		});
	});
};