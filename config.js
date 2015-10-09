module.exports = {
	knex: {
		client: 'pg',
		connection: {
			host     : '127.0.0.1',
			user     : 'user',
			password : '',
			database : 'appdb',
			charset  : 'utf8'
		},
		migrations: {
			tableName: 'migrations'
		}
	}
}