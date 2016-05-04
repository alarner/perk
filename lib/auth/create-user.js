let UserModel = require('../../models/User');
let Howhap = require('howhap');
let config = require('../config');
module.exports = function(userData, t) {
	let newUser = new UserModel(userData);
	return newUser.save(null, {transacting: t})
	.catch(function(err) {
		console.log('ERR 3');
		throw new Howhap(
			config.errors.auth.UNKNOWN,
			{message: err.toString()}
		);
	});
	// todo: add error handling
};