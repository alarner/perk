let validator = require('validator');
module.exports = function(req, res, next) {	
	if(!req.body.email) {
		res.error.add('auth.MISSING_EMAIL', 'email');
		// errors.email = 'Please enter an email address';
	}
	else if(!validator.isEmail(req.body.email)) {
		res.error.add('auth.INVALID_EMAIL', 'email');
		// errors.email = 'It looks like there\'s somthing wrong with that email address';
	}

	if(!req.body.password) {
		res.error.add('auth.MISSING_PASSWORD', 'password');
		// errors.password = 'Please enter a password';
	}

	// There is at least one error
	if(!res.error.send()) {
		next();
	}
};