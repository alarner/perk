const OAuth1Strategy = require('passport-oauth1');
const request = require('request');

function TrelloStrategy(options, verify) {
	OAuth1Strategy.call(this, Object.assign({
		requestTokenURL: 'https://trello.com/1/OAuthGetRequestToken',
		accessTokenURL: 'https://trello.com/1/OAuthGetAccessToken',
		userAuthorizationURL: 'https://trello.com/1/OAuthAuthorizeToken',
		sessionKey: 'trello',
		consumerKey: options.clientID,
		consumerSecret: options.clientSecret
	}, options), (req, accessToken, refreshToken, profile, done) => {
		request(`https://api.trello.com/1/members/me?key=${options.clientID}&token=${accessToken}`,
			(err, response, body) => {
				if (err) return done(err);
				const profile = JSON.parse(body);
				const namePieces = profile.fullName.split(' ');
				const result = { id: profile.id };
				result[config.auth.columns.user.firstName] = namePieces.shift();
				result[config.auth.columns.user.lastName] = namePieces.join(' ');
				result[config.auth.columns.user.email] = null;
				verify(req, accessToken, refreshToken, result, done);
			}
		);
	});
	this.name = 'trello';
};
TrelloStrategy.prototype = Object.create(OAuth1Strategy.prototype);


module.exports = {
	translateProfile: (token, tokenSecret, profile, cb) => { cb(null, profile); },
	strategy: TrelloStrategy,
	packageName: 'passport-oauth1'
};
