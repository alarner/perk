let config = require('../config');
module.exports = function(req1, res1, next1) {
	

	function middleware(req, res, next) {
		let options = { defaultFormat: config.webserver.response.defaultFormat };
		if(req1 !== req) {
			options = Object.assign(options, req1);
		}
		if(req.query.responseFormat) {
			options.defaultFormat = req.query.responseFormat;
		}
		if(!req.user) {
			res.error.add('auth.NOT_LOGGED_IN');
		}

		let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
		if(!res.error.send('/auth/login?redirect='+encodeURIComponent(fullUrl), options.defaultFormat)) {
			next();
		}
	}

	if(!req1.hasOwnProperty('res')) {
		return middleware;
	}

	middleware(req1, res1, next1);
};