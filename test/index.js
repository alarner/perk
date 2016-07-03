before(done => {
	global.knex = require('knex')({
		client: 'sqlite3',
		useNullAsDefault: true,
		connection: {
			filename: './test/fixtures/test1.db'
		},
		seeds: {
			directory: './test/seeds'
		}//,
		// debug: true
	});
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
		done();
	});
});