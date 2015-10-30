'use strict';
/*globals bookshelf */
var AuthenticationModel = require('../../models/Authentication');
var UserModel = require('../../models/User');

module.exports = function(profileTranslator) {
	console.log('authenticator', profileTranslator);
	return function(accessToken, refreshToken, profile, done) {
		console.log('authenticator111');
		profileTranslator(accessToken, refreshToken, profile, function(err, profileData) {
			console.log('translator finished');
			if(err) {
				return done(err);
			}

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
						var newUser = new UserModel({
							firstName: profileData.firstName,
							lastName: profileData.lastName,
							email: profileData.email
						});
						var newAuth = null;
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