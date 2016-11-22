const config = require('../config');
module.exports = function(req, res, next) {
	if(!req.session.hasOwnProperty('_auth_profile')) {
		return res.redirect('/auth/error');
	}
	if(!req.session.hasOwnProperty('_auth_type')) {
		return res.redirect('/auth/error');
	}
	if(!config.auth.adapters.hasOwnProperty(req.session._auth_type)) {
		return res.redirect('/auth/error');
	}
	if(req.session._auth_profile[config.auth.columns.user.email] && req.originalUrl !== '/auth/finish') {
		return res.redirect('/auth/finish');
	}
	next();
};
