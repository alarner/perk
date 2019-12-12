const db = require('./db');
module.exports = config => {
	db.connect(config.database);
	return {
		async create(name) {
			return await db.db.migrate.make(name, config);
		},
		async latest() {
			return await db.db.migrate.latest(config);
		},
		async rollback() {
			return await db.db.migrate.rollback(config);
		}
	};
}
