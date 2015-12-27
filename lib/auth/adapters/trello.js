var OAuth1Strategy = require('passport-oauth1');
var request = require('request');

function TrelloStrategy(options, verify) {
	options = options || {};
	options.requestTokenURL = options.requestTokenURL || 'https://trello.com/1/OAuthGetRequestToken';
	options.accessTokenURL = options.accessTokenURL || 'https://trello.com/1/OAuthGetAccessToken';
	options.userAuthorizationURL = options.userAuthorizationURL || 'https://trello.com/1/OAuthAuthorizeToken';
	options.sessionKey = options.sessionKey || 'trello';

	OAuth1Strategy.call(this, options, (req, accessToken, refreshToken, profile, done) => {
		request(
			'https://api.trello.com/1/members/me?key='+options.consumerKey+'&token='+accessToken,
			function (error, response, body) {
				if(error) {
					return done(error);
				}
				var profile = JSON.parse(body);
				var namePieces = profile.fullName.split(' ');
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
TrelloStrategy.prototype = OAuth1Strategy.prototype;


module.exports = {
	translateProfile: (token, tokenSecret, profile, cb) => { cb(null, profile); },
	strategy: TrelloStrategy
};