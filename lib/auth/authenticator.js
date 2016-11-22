let AuthenticationModel = require('../../models/Authentication');
let UserModel = require('../../models/User');
let config = require('../config');

module.exports = function(req, accessToken, profile, adapterName, done) {
	AuthenticationModel
	.forge({identifier: profile.id})
	.fetch()
	.then(function(auth) {
		// RETURN EXISTING USER
		if(auth) {
			auth
			.user()
			.fetch()
			.then(function(user) {
				done(null, auth, user);
			})
			.catch(function(err) {
				done(err);
			});
		}
		// ASK USER FOR EMAIL
		else if(!profile[config.auth.columns.user.email] && config.auth.adapters[adapterName].requireEmail) {
			req.session._auth_profile = profile;
			req.session._auth_type = adapterName;
			req.session._auth_access_token = accessToken;
			return req.res.redirect('/auth/email');
		}
		// CREATE NEW USER
		else {
			bookshelf.transaction(function(t) {
				const userData = {};
				userData[config.auth.columns.user.firstName] = profile[config.auth.columns.user.firstName];
				userData[config.auth.columns.user.lastName] = profile[config.auth.columns.user.lastName];
				userData[config.auth.columns.user.email] = profile[config.auth.columns.user.email];
				let newUser = new UserModel(userData);
				let newAuth = null;
				newUser.save(null, {transacting: t})
				.then(function(user) {
					const authData = {};
					authData[config.auth.columns.authentication.type] = adapterName;
					authData[config.auth.columns.authentication.identifier] = profile.id;
					authData[config.auth.columns.authentication.password] = null;
					authData[config.auth.columns.authentication.data] = {accessToken: accessToken};
					authData[config.auth.columns.authentication.userId] = user.id;
					return AuthenticationModel.forge(authData)
					.save(null, {transacting: t})
					.then(function(newAuthModel) {
						newAuth = newAuthModel;
					});
				})
				.then(t.commit)
				.then(function() {
					done(null, newAuth, newUser);
				})
				.catch(function(err) {
					t.rollback();
					done(err);
				});
			});
		}
	});
};
