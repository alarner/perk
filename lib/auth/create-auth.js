const AuthModel = require('../../models/Authentication');
const bcrypt = require('bcrypt');
const Howhap = require('howhap');
const config = require('../config');

function rejectUnknown(err, reject) {
	reject(new Howhap(
		config.errors.auth.UNKNOWN,
		{message: err.toString()}
	));
}


module.exports = function(user, password, t) {
	return new Promise(function(resolve, reject) {
		bcrypt.genSalt(config.auth.adapters.local.saltRounds, function(err, salt) {
			if(err) {
				return rejectUnknown(err, reject);
			}

			bcrypt.hash(password, salt, function(err, hash) {
				if(err) {
					return rejectUnknown(err, reject);
				}
				const authData = {};
				authData[config.auth.columns.authentication.type] = 'local';
				authData[config.auth.columns.authentication.identifier] = user.get(config.auth.columns.user.email);
				authData[config.auth.columns.authentication.password] = hash;
				authData[config.auth.columns.authentication.userId] = user.id;
				AuthModel.forge(authData)
				.save(null, {transacting: t})
				.then(() => resolve(user))
				.catch(err => {
					return rejectUnknown(err, reject);
				});
			});
		});
	});
};
