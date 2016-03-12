module.exports = function(req, res, next) {	
	if(!req.user) {
		res.error.add('auth.NOT_LOGGED_IN');
	}

	let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	if(!res.error.send('/auth/login?redirect='+encodeURIComponent(fullUrl))) {
		next();
	}
};