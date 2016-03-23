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
		else if(!profile.email && config.auth[adapterName].requireEmail) {
			req.session._auth_profile = profile;
			req.session._auth_type = adapterName;
			req.session._auth_access_token = accessToken;
			return req.res.redirect('/auth/email');
		}
		// CREATE NEW USER
		else {
			bookshelf.transaction(function(t) {
				let newUser = new UserModel({
					firstName: profile.firstName,
					lastName: profile.lastName,
					email: profile.email
				});
				let newAuth = null;
				newUser.save(null, {transacting: t})
				.then(function(user) {
					return AuthenticationModel.forge({
						type: adapterName,
						identifier: profile.id,
						password: null,
						data: {accessToken: accessToken},
						userId: user.id
					})
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