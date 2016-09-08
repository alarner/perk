const fs = require('fs');
const path = require('path');

before((done) => {
	global.knex = require('knex')({
		client: 'sqlite3',
		useNullAsDefault: true,
		connection: {
			filename: './test/fixtures/test.db'
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
	.catch((err) => {
		console.log('MIGRATION / SEED ERROR:');
		console.log(err);
		done(err);
	});
});

beforeEach((done) => {
	knex.seed.run()
	.then(() => {
		done();
	})
	.catch((err) => {
		console.log('MIGRATION / SEED ERROR:');
		console.log(err);
		done(err);
	});
});

after((done) => {
	fs
	.createReadStream(path.join(__dirname, 'fixtures/test_template.db'))
	.pipe(fs.createWriteStream(path.join(__dirname, 'fixtures/test.db')))
	.on('close', done);
});
