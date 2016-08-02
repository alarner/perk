const UserModel = require('../../models/User');
const Howhap = require('howhap');
const config = require('../config');
module.exports = function(userData, t) {
	const newUser = new UserModel(userData);
	return newUser.save(null, {transacting: t})
	.catch(function(err) {
		throw new Howhap(
			config.errors.auth.UNKNOWN,
			{ message: err.toString() }
		);
	});
};