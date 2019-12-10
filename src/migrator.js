const db = require('./db');
module.exports = config => ({
	create(name) {
		db.connect(config.database);
		return db.db.migrate.make(name, config);
	},
	latest() {
		db.connect(config.database);
		return db.db.migrate.latest(config);
	},
	rollback() {
		db.connect(config.database);
		return db.db.migrate.rollback(config);
	}
})
