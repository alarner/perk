module.exports = {
	translateProfile: function(accessToken, refreshToken, profile, cb) {
		const pieces = profile.displayName.split(' ');
		const firstName = pieces.shift();
<<<<<<< HEAD
		const lastName = null;
		if(pieces.length > 0) {
			lastName = pieces.join(' ');
		}
		const email = profile.emails
		.filter(data => data.primary);
=======
		let lastName = null;
		if (pieces.length > 0) {
			lastName = pieces.join(' ');
		}
		const email = profile.emails || [];
		const primaryEmail = email.filter(data => data.primary);
>>>>>>> 491380e63a5d2b2e1831a8ffbbdfad2c20a4fc2f

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