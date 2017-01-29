const validator = require('validator');
const config = require('../config');
module.exports = function(req, res, next) {
	if(!req.body[config.auth.columns.user.email]) {
		res.error.add('auth.MISSING_EMAIL', config.auth.columns.user.email);
	}
	else if(!validator.isEmail(req.body[config.auth.columns.user.email])) {
		res.error.add('auth.INVALID_EMAIL', config.auth.columns.user.email);
	}

	if(!req.body[config.auth.columns.authentication.password]) {
		res.error.add('auth.MISSING_PASSWORD', config.auth.columns.authentication.password);
	}

	// There is at least one error
	if(!res.error.send()) {
		next();
	}
};
