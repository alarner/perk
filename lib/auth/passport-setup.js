'use strict';
var passport = require('passport');
var config = require('../config');
var authenticator = require('./authenticator');
var UserModel = require('../../models/User');

// STRATEGIES
var GoogleStrategy = require('passport-google-oauth2').Strategy;

module.exports = function(app) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		UserModel.forge({id: id}).fetch().then(
			function(user) {
				done(null, user);
			},
			function(err) {
				done(err);
			}
		);
	});

	var authCallback = authenticator(require('./profile-translators/google'));
	passport.use(
		new GoogleStrategy({
			clientID: '740759733588-jojf53b4sb97l30dle60sdlletp9266h.apps.googleusercontent.com',
			clientSecret: 'NzIgQ4x64z72Yr1vi2veolda',
			callbackURL: 'http://localhost:3000/user/login/google/callback'
		}, function() {
			console.log('google strategy running');
		})
	);

	app.use(passport.initialize());
	app.use(passport.session());
};