let OAuth1Strategy = require('passport-oauth1');
let request = require('request');

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
				let profile = JSON.parse(body);
				let namePieces = profile.fullName.split(' ');
				verify(req, accessToken, refreshToken, {
					id: profile.id,
					firstName: namePieces.shift(),
					lastName: namePieces.join(' '),
					email: null
				}, done);
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
