import knex, { Config, Raw } from "knex";
import { DbTransactionCallback_T, GenericObject_T } from "./types";

class Db {
	private db: knex<any, unknown[]>;
	constructor() {
		this.db = null;
	}
	public connect(config: Config) {
		if (!this.isConnected()) {
			this.db = knex(config);
		}
	}
	public query(sql: string, params: GenericObject_T): Raw<any> {
		if (!this.isConnected()) {
			throw new Error("Cannot query database before we have connected");
		}
		return this.db.raw(sql, params);
	}
	private raw(fn: (sql: string, params: GenericObject_T) => Raw<any>) {
		return (sql: string, params: GenericObject_T): Raw<any> => {
			if (!this.isConnected()) {
				throw new Error(
					"Cannot query database before we have connected"
				);
			}
			return fn(sql, params);
		};
	}
	public async disconnect() {
		if (this.isConnected()) {
			await this.db.destroy();
			this.db = null;
		}
	}
	public isConnected() {
		return !!this.db;
	}
	public transaction(callback: DbTransactionCallback_T) {
		return this.db.transaction((trx) => {
			return callback({ query: this.raw(trx.raw.bind(trx)) });
		});
	}
}

export const db = new Db();
