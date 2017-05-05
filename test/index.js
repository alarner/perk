const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

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
global.redis = new Redis({
	port: 6379,
	host: '127.0.0.1'
});
global.bookshelf = require('bookshelf')(global.knex);
global.app = require('../app');
bookshelf.plugin('registry');

before((done) => {
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
	.then(() => redis.flushdb())
	.then(() => done())
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
