module.exports = function(req, res, next) {
	if(req.session._flash_messages) {
		res.locals.messages = req.session._flash_messages;
	}
	else {
		res.locals.messages = {};
	}
	req.session._flash_messages = {};
	req.flash = function(type, message) {
		req.session._flash_messages[type] = message;
	};
	next();
};