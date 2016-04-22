if(process.env.HEROKU_POSTINSTALL) {
	process.env.NODE_ENV = 'heroku';

	let config = require('./lib/config');
	let knex = require('knex')(config.database);


	knex.migrate.latest()
	.then(function() {
		process.exit(0);
	})
	.catch(function(err) {
		console.warn(err.toString());
		process.exit(1);
	});
}