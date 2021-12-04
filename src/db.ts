import knex, { Config } from "knex";
import { DbTransactionCallback_T, QueryParams_T, QueryResult_T } from "./types";

class Db {
	public client: knex<unknown, unknown[]>;
	constructor() {
		this.client = null;
	}
	public async connect(config: Config): Promise<void> {
		if (!this.isConnected()) {
			this.client = knex(config);
		}
	}
	public query<T>(
		sql: string,
		params?: QueryParams_T
	): Promise<QueryResult_T<T>> {
		if (!this.isConnected()) {
			throw new Error("Cannot query database before we have connected");
		}
		return this.client.raw(sql, params);
	}
	private raw(
		fn: <T>(
			sql: string,
			params?: QueryParams_T
		) => Promise<QueryResult_T<T>>
	) {
		return <T>(
			sql: string,
			params: QueryParams_T
		): Promise<QueryResult_T<T>> => {
			if (!this.isConnected()) {
				throw new Error(
					"Cannot query database before we have connected"
				);
			}
			return fn(sql, params);
		};
	}
	public async disconnect(): Promise<void> {
		if (this.isConnected()) {
			await this.client.destroy();
			this.client = null;
		}
	}
	public isConnected(): boolean {
		return !!this.client;
	}
	public transaction<T>(callback: DbTransactionCallback_T<T>): Promise<T> {
		return this.client.transaction((trx) => {
			return callback({ query: this.raw(trx.raw.bind(trx)) });
		});
	}
}

export type Db_T = Db;

export const db = new Db();
