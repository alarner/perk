let passport = require('passport');
let path = require('path');
let UserModel = require('../../models/User');
let authenticator = require('./authenticator');
let config = require('../config');
let includeAll = require('include-all');
let adapters = includeAll({
	dirname: __dirname + '/adapters',
	filter: /(.+)\.js$/
});

module.exports = function(app) {
	if(!config.auth) return;
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

	for(let adapterName in config.auth) {
		adapterName = adapterName.toLowerCase();
		if(!adapters.hasOwnProperty(adapterName)) {
			console.warn('Auth adapter "'+adapterName+'" does not exist.');
		}
		else {
			let adapter = adapters[adapterName];
			let authCallback = authenticator(adapter.translateProfile);
			let strategyConfig = config.auth[adapterName];
			let defaultCallback = config.webserver.baseUrl + '/' + path.join(
				'auth',
				adapterName,
				'callback'
			);
			strategyConfig.callbackURL = strategyConfig.callbackURL || defaultCallback;
			passport.use(new adapter.strategy(strategyConfig, authCallback));
		}
	}

	app.use(passport.initialize());
	app.use(passport.session());
};