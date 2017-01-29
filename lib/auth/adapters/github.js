const config = require('../../config');
module.exports = {
	translateProfile: function(accessToken, refreshToken, profile, cb) {
		const pieces = profile.displayName.split(' ');
		const firstName = pieces.shift();
		let lastName = null;
		if (pieces.length > 0) {
			lastName = pieces.join(' ');
		}
		const email = profile.emails || [];
		const primaryEmail = email.filter(data => data.primary);

		const result = { id: profile.id };
		result[config.auth.columns.user.firstName] = firstName;
		result[config.auth.columns.user.lastName] = lastName;
		result[config.auth.columns.user.email] = primaryEmail.length ? primaryEmail[0].value : null;
		return cb(null, result);
	},
	strategy: require('passport-github').Strategy,
	packageName: 'passport-github'
};
