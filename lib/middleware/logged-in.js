let config = require('../config');
module.exports = function(req, res, next) {
	let options = { defaultFormat: config.webserver.response.defaultFormat };

	function middleware(req, res, next) {
		if(!req.user) {
			res.error.add('auth.NOT_LOGGED_IN');
		}

		let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
		if(!res.error.send('/auth/login?redirect='+encodeURIComponent(fullUrl), options.defaultFormat)) {
			next();
		}
	}

	if(!req.hasOwnProperty('res')) {
		options = Object.assign(options, req);
		return middleware;
	}

	middleware(req, res, next);
};