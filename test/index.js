let config = require('../lib/config');
before(done => {
	global.knex = require('knex')(config.testDatabase);
	global.app = require('../app');

	knex.migrate.latest()
	.then(() => {
		return knex.seed.run();
	})
	.then(() => {
		done();
	})
	.catch(err => {
		console.log('MIGRATION / SEED ERROR:');
		console.log(err);
	});
});

beforeEach(done => {
	knex.seed.run()
	.then(() => {
		done();
	})
	.catch(err => {
		console.log('MIGRATION / SEED ERROR:');
		console.log(err);
	});
});