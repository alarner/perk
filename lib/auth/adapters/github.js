module.exports = {
	translateProfile: function(accessToken, refreshToken, profile, cb) {
		let pieces = profile.displayName.split(' ');
		let firstName = pieces.shift();
		let lastName = null;
		if(pieces.length > 0) {
			lastName = pieces.join(' ');
		}
		let email = profile.emails
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