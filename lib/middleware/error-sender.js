// let _ = require('lodash');
module.exports = function(req, res, next) {
	res.error = function(message, status, key, redirect) {
		if(req.accepts('html')) {
			console.log('error');
			req.flash(key || 'default', message);
			req.flash('body', req.body);
			res.redirect(redirect);
		}
		else {
			res.status(status).json({
				message: message,
				status: status
			});
		}
	};
	next();
};