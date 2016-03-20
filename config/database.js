module.exports = {
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password: '',
		database: 'test',
		charset: 'utf8'
	},
	migrations: {
		tableName: 'migrations'
	},
	seeds: {
		directory: './seeds/dev'
	}
};