let UserModel = require('../../models/User');
let Howhap = require('howhap');
let config = require('../config');
module.exports = function(userData, t) {
	let newUser = new UserModel(userData);
	return newUser.save(null, {transacting: t})
	.catch(function(err) {
		throw new Howhap(
			config.errors.auth.UNKNOWN,
			{ message: err.toString() }
		);
	});
};