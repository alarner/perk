const db = require('./db');
module.exports = config => ({
	async create(name) {
		db.connect(config.database);
		const result = await db.db.migrate.make(name, config);
		await db.disconnect();
		return result;
	},
	async latest() {
		db.connect(config.database);
		const result = await  db.db.migrate.latest(config);
		await db.disconnect();
		return result;
	},
	async rollback() {
		db.connect(config.database);
		const result = await  db.db.migrate.rollback(config);
		await db.disconnect();
		return result;
	}
})
