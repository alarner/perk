let config = require('../config');
let _ = require('lodash');
module.exports = function(req, res, next) {
	let type = req.params.type.toLowerCase();
	if(!config.auth || !_.isObject(config.auth)) {
		return res.status(500).json({
			message: 'No defined authentication methods',
			status: 500
		});
	}
	if(!config.auth.hasOwnProperty(type)) {
		return res.status(500).json({
			message: '"'+type+'" is not a valid authentication method',
			status: 400
		});
	}
	req.params.type = type;
	next();
};