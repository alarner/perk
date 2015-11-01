module.exports = function(req, res, next) {
	if(!req.session.hasOwnProperty('_auth_profile')) {
		return res.redirect('/auth/error');
	}
	if(req.session._auth_profile.email && req.originalUrl !== '/auth/finish') {
		return res.redirect('/auth/finish');
	}
	next();
};