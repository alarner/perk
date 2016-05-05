let AuthModel = require('../../models/Authentication');
let bcrypt = require('bcrypt');
let Howhap = require('howhap');
let config = require('../config');

function rejectUnknown(err, reject) {
	reject(new Howhap(
		config.errors.auth.UNKNOWN,
		{message: err.toString()}
	));
}


module.exports = function(user, password, t) {
	return new Promise(function(resolve, reject) {
		bcrypt.genSalt(config.auth.local.saltRounds, function(err, salt) {
			if(err) {
				return rejectUnknown(err, reject);
			}

			bcrypt.hash(password, salt, function(err, hash) {
				if(err) {
					return rejectUnknown(err, reject);
				}
				AuthModel.forge({
					type: 'local',
					identifier: user.get('email'),
					password: hash,
					userId: user.id
				})
				.save(null, {transacting: t})
				.then(() => resolve(user))
				.catch(err => {
					return rejectUnknown(err, reject);
				});
			});
		});
	});
};