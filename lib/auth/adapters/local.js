module.exports = {
	translateProfile: function(accessToken, refreshToken, profile, cb) {
		console.log(accessToken, refreshToken, profile);
		return cb(null, {
			id: 'id goes here',
			firstName: 'profile.name.givenName',
			lastName: 'profile.name.familyName',
			email: 'profile.email'
		});	
	},
	strategy: require('passport-local').Strategy
};