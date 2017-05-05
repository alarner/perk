module.exports = function(descriptor) {
	return (req, res, next) => {
		if(!req.user || !req.user.hasPermission(descriptor)) {
			res.error.add('auth.NOT_PERMITTED').send();
		}
		next();
	};
};
