const knex = require('knex');

class Db {
	connect(config) {
		this.db = knex(config);
	}
	query(sql, params) {
		return this.db.raw(sql, params);
	}
	close() {
		return new Promise((resolve, reject) => {
			this.db.destroy(err => err ? reject(err) : resolve());
		});
	}
}

module.exports = new Db();
