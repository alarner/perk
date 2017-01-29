const config = require('../config');
const _ = require('lodash');
module.exports = function(req, res, next) {
	let type = req.params.type.toLowerCase();
	if(!config.auth.adapters || !_.isObject(config.auth.adapters)) {
		return res.status(500).json({
			message: 'No defined authentication methods',
			status: 500
		});
	}
	if(!config.auth.adapters.hasOwnProperty(type)) {
		return res.status(500).json({
			message: '"'+type+'" is not a valid authentication method',
			status: 400
		});
	}
	req.params.type = type;
	next();
};
