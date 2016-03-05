module.exports = {
	database: {
		connection: process.env.DATABASE_URL
	},
	session: {
		secret: process.env.SESSION_SECRET,
		store: {
			url: process.env.REDISTOGO_URL
		}
	}
};