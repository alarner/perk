const knex = require('knex');

class Db {
	connect(config) {
		this.db = knex(config);
	}
	query(sql, params) {
		return this.db.raw(sql, params);
	}
}

module.exports = new Db();
