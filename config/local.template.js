module.exports = {
	database: {
		connection: {
			host: '[string] The database host',
			user: '[string] The database user',
			password: '[string] The database user\'s password',
			database: '[string] The database name'
		}
	},
	/*
	auth: {
		google: {
			clientID: '[string] Google API client identifier',
			clientSecret: '[string] Google API client secret'
		},
		trello: {
			consumerKey: '[string] Trello API consumer key',
			consumerSecret: '[string] Trello API consumer secret',
			trelloParams: {
				scope: '[string] Trello API scope',
				name: '[string] Trello app name',
				expiration: '[string] Trello API key expiration'
			}
		}
	},
	*/
	deploy: {
		default: {
			type: '[string] Deployment type [digitalocean]',
			key: '[string] Deployment API key'
		}
	}
};