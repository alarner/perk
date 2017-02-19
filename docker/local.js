module.exports = {
	'database': {
		'client': 'pg',
		'connection': {
			'host': 'postgres',
			'user': process.env.POSTGRES_USER,
			'password': process.env.POSTGRES_PASSWORD,
			'database': process.env.POSTGRES_DB
		}
	},
	'session': {
		'store': {
			'host': process.env.REDIS_HOST,
			'port': 6379
		}
	}
};
