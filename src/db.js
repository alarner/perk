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
		if(!this.isConnected()) {
			throw new Error('Cannot query database before we have connected');
		}
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
	transaction(callback) {
		return this.db.transaction(callback);
	}
}

module.exports = new Db();
