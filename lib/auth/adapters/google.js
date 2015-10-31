module.exports = {
	translateProfile: function(accessToken, refreshToken, profile, cb) {
		return cb(null, {
			id: profile.id,
			firstName: profile.name.givenName,
			lastName: profile.name.familyName,
			email: profile.email
		});	
	},
	strategy: require('passport-google-oauth2').Strategy
};