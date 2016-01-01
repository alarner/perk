let validator = require('validator');
let path = require('path');
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
	// if(Object.keys(errors).length) {
	// 	if(req.accepts('html')) {
	// 		for(let i in errors) {
	// 			req.flash(i, errors[i]);
	// 		}
	// 		res.redirect(path.join('/auth', req.path));
	// 	}
	// 	else {
	// 		let message = '';
	// 		for(let i in errors) {
	// 			message = errors[i];
	// 		}
	// 		res.status(400).json({
	// 			message: message,
	// 			status: 400
	// 		});
	// 	}
	// }
	// else {
	// 	next();
	// }
};