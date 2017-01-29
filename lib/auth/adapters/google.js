module.exports = {
	translateProfile: function(accessToken, refreshToken, profile, cb) {
		const result = { id: profile.id };
		result[config.auth.columns.user.firstName] = profile.name.givenName;
		result[config.auth.columns.user.lastName] = profile.name.familyName;
		result[config.auth.columns.user.email] = profile.email;
		return cb(null, result);
	},
	strategy: require('passport-google-oauth2').Strategy,
	packageName: 'passport-google-oauth2'
};
