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

		return cb(null, {
			id: profile.id,
			firstName: firstName,
			lastName: lastName,
			email: primaryEmail.length ? primaryEmail[0].value : null
		});
	},
	strategy: require('passport-github').Strategy,
	packageName: 'passport-github'
};