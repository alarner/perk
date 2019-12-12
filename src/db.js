const knex = require('knex');

class Db {
	constructor() {
		this.db = null;
	}
	connect(config) {
		if(!this.isConnected()) {
			this.db = knex(config);
		}
	}
	query(sql, params) {
		return this.db.raw(sql, params);
	}
	async disconnect() {
		if(this.isConnected()) {
			await this.db.destroy();
			this.db = null;
		}
	}
	isConnected() {
		return !!this.db;
	}
}

module.exports = new Db();
