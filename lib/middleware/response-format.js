let config = require('../config');
module.exports = function(req, res, next) {
	const validFormats = ['html', 'json'];
	req.responseFormat = function() {
		let format = null;
		if(req.query && req.query.responseFormat) {
			format = req.query.responseFormat.toString().toLowerCase();
		}
		if(validFormats.indexOf(format) === -1) {
			format = config.webserver.response.defaultFormat;
		}
		return format;
	};
	next();
};