let fb = require('fb');
module.exports = {
	translateProfile: function(accessToken, refreshToken, profile, cb) {
		fb.setAccessToken(accessToken);
		fb.api('/me', { fields: ['email'] }, function (res) {
			if(res && res.error) {
				if(res.error.code === 'ETIMEDOUT') {
					console.log('request timeout');
				}
				else {
					console.log('error', res.error);
				}
			}
			else {
				let pieces = profile.displayName.split(' ');
				let firstName = null;
				let lastName = null;
				if(pieces.length > 1) {
					lastName = pieces.pop();
					firstName = pieces.join(' ');
				}
				else if(pieces.length === 1) {
					firstName = pieces[0];
				}
				return cb(null, {
					id: profile.id,
					firstName: firstName,
					lastName: lastName,
					email: res.email
				});
			}
		});
	},
	strategy: require('passport-facebook').Strategy
};