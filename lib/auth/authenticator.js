let AuthenticationModel = require('../../models/Authentication');
let UserModel = require('../../models/User');

module.exports = function(profileTranslator) {
	return function(req, accessToken, refreshToken, profile, done) {
		profileTranslator(accessToken, refreshToken, profile, function(err, profileData) {
			if(err) {
				return done(err);
			}
			if(!profile.email) {
				req.session._auth_profile = profileData;
				req.res.redirect('/auth/email');
			}

			console.log('PROFILE TRANSLATOR');

			AuthenticationModel
			.forge({identifier: profileData.id})
			.fetch()
			.then(function(auth) {
				// RETURN EXISTING USER
				if(auth) {
					auth
					.user()
					.fetch()
					.then(function(user) {
						done(null, user);
					})
					.catch(function(err) {
						done(err);
					});
				}
				// CREATE EXISTING USER
				else {
					bookshelf.transaction(function(t) {
						let newUser = new UserModel({
							firstName: profileData.firstName,
							lastName: profileData.lastName,
							email: profileData.email
						});
						let newAuth = null;
						newUser.save(null, {transacting: t})
						.then(function(user) {
							return AuthenticationModel.forge({
								type: 'google',
								identifier: profileData.id,
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
							done(null, newAuth);
						})
						.catch(function(err) {
							t.rollback();
							done(err);
						});
					});
				}
			});
		});
	};
};