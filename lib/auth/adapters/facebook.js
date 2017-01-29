const fb = require('fb');
const config = require('../../config');
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
				const pieces = profile.displayName.split(' ');
				let firstName = null;
				let lastName = null;
				if(pieces.length > 1) {
					lastName = pieces.pop();
					firstName = pieces.join(' ');
				}
				else if(pieces.length === 1) {
					firstName = pieces[0];
				}
				const result = { id: profile.id };
				result[config.auth.columns.user.firstName] = firstName;
				result[config.auth.columns.user.lastName] = lastName;
				result[config.auth.columns.user.email] = email;
				return cb(null, result);
			}
		});
	},
	strategy: require('passport-facebook').Strategy,
	packageName: 'passport-facebook'

};
