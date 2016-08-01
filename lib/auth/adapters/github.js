module.exports = {
	translateProfile: function(accessToken, refreshToken, profile, cb) {
		const pieces = profile.displayName.split(' ');
		const firstName = pieces.shift();
		const lastName = null;
		if(pieces.length > 0) {
			lastName = pieces.join(' ');
		}
		const email = profile.emails
		.filter(data => data.primary);

		return cb(null, {
			id: profile.id,
			firstName: firstName,
			lastName: lastName,
			email: email.length ? email[0].value : null
		});
	},
	strategy: require('passport-github').Strategy,
	packageName: 'passport-github'
};