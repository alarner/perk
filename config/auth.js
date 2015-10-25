'use strict';

var webserver = require('./webserver');

module.exports = {
	google: {
		clientID: '{{ Google OAuth2 Client ID }}',
		clientSecret: '{{ Google OAuth2 Client Secret }}',
		callbackURL: webserver.baseUrl+'/api/v1/auth/google/login',
		scope: [
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/calendar'
		]
	},
	trello: {
		consumerKey: '{{ Trello Consumber Key }}',
		consumerSecret: '{{ Trello Consumer Secret }}',
		callbackURL: webserver.baseUrl+'/user/login/google/callback',
		scope: [
			'read',
			'write'
		]
	}
};