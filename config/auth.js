module.exports = {
	local: {
		saltRounds: 10,
		registerRedirect: '/dashboard',
		loginRedirect: '/dashboard'
	},
	google: {
		clientID: '{{ Google OAuth2 Client ID }}',
		clientSecret: '{{ Google OAuth2 Client Secret }}',
		// https://developers.google.com/gmail/api/auth/scopes
		// https://developers.google.com/+/web/api/rest/oauth?hl=en
		// https://developers.google.com/google-apps/calendar/auth
		scope: [
			// 'https://www.googleapis.com/auth/userinfo.email',
			// 'https://www.googleapis.com/auth/userinfo.profile',
			// 'https://www.googleapis.com/auth/calendar'
		],
		requireEmail: true,
		redirect: '/dashboard'
	},
	facebook: {
		clientID: '{{ Facebook OAuth2 Client ID }}',
		clientSecret: '{{ Facebook OAuth2 Client Secret }}',
		// https://developers.facebook.com/docs/facebook-login/permissions
		scope: [
			// 'email'
		],
		requireEmail: true,
		redirect: '/dashboard'
	},
	trello: {
		consumerKey: '{{ Trello Consumber Key }}',
		consumerSecret: '{{ Trello Consumer Secret }}',
		scope: [
			// 'read',
			// 'write'
		],
		requireEmail: true,
		redirect: '/dashboard'
	}
};