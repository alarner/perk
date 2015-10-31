module.exports = {
	google: {
		clientID: '{{ Google OAuth2 Client ID }}',
		clientSecret: '{{ Google OAuth2 Client Secret }}',
		scope: [
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/calendar'
		]
	},
	trello: {
		consumerKey: '{{ Trello Consumber Key }}',
		consumerSecret: '{{ Trello Consumer Secret }}',
		scope: [
			'read',
			'write'
		]
	}
};