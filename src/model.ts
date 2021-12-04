import { InternalServerError, NotFound } from "./HTTPError";
import { db } from "./db";
import {
	JSONValue_T,
	ModelFetchOptions_T,
	ModelSaveOptions_T,
	Transactable_T,
} from "./types";

type ModelField_T<T> = Extract<keyof T, string>;
type ModelFieldGetter_T<T> = () => ModelField_T<T> | null;

interface ModelParams_T<T> {
	table: string;
	getIdField: ModelFieldGetter_T<T>;
	getCreatedField: ModelFieldGetter_T<T>;
	getUpdatedField: ModelFieldGetter_T<T>;
	getDeletedField: ModelFieldGetter_T<T>;
}

export abstract class Model<T> {
	public readonly table: string;
	public readonly getIdField: ModelFieldGetter_T<T>;
	public readonly getCreatedField: ModelFieldGetter_T<T>;
	public readonly getUpdatedField: ModelFieldGetter_T<T>;
	public readonly getDeletedField: ModelFieldGetter_T<T>;
	constructor(params: ModelParams_T<T>) {
		this.table = params.table;
		this.getIdField = params.getIdField;
		this.getCreatedField = params.getCreatedField;
		this.getUpdatedField = params.getUpdatedField;
		this.getDeletedField = params.getDeletedField;
	}
	async save(
		record: Partial<T>,
		{ returnNew, query }: ModelSaveOptions_T = {}
	): Promise<T | null> {
		const dbQuery = query || db.query.bind(db);
		const idField = this.getIdField();
		const keys: ModelField_T<T>[] = (Object.keys(record) as ModelField_T<
			T
		>[]).filter((k) => k !== idField);
		if (!keys.length) {
			throw new Error("Record has nothing new to save.");
		}

		let id = record[idField];

		if (record[idField] !== undefined) {
			const updateField = this.getUpdatedField();
			if (!record[updateField]) {
				((record[
					updateField
				] as unknown) as string) = new Date().toISOString();
				keys.push(updateField);
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const params: any[] = [this.table];
			for (const key of keys) {
				params.push(key);
				params.push(record[key]);
			}
			params.push(idField);
			params.push(record[idField]);
			await dbQuery(
				`update ?? set ${keys
					.map(() => "?? = ?")
					.join(", ")} where ?? = ?`,
				params
			);
		} else {
			const createdField = this.getCreatedField();
			if (!record[createdField]) {
				((record[
					createdField
				] as unknown) as string) = new Date().toISOString();
				keys.push(createdField);
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const values: any[] = keys.map((k) => {
				const val = record[k];
				if (["boolean", "number", "string"].includes(typeof val)) {
					return val;
				}
				return JSON.stringify(val);
			});
			const params: JSONValue_T[] = [this.table as JSONValue_T]
				.concat(keys)
				.concat(values)
				.concat(idField);
			const result = await dbQuery(
				`
					insert into ?? (${keys.map(() => "??").join(", ")})
					values (${keys.map(() => "?").join(", ")})
					returning ??
				`,
				params
			);
			id = result.rows[0][idField];
		}
		if (returnNew) {
			return this.fetch(({ [idField]: id } as unknown) as T, { query });
		}
		return null;
	}
	async saveAndFetch(
		record: Partial<T>,
		opts: Transactable_T = {}
	): Promise<T> {
		const result = await this.save(record, {
			returnNew: true,
			query: opts.query,
		});
		if (!result) {
			throw new InternalServerError("FAILED_TO_SAVE");
		}
		return result;
	}
	async fetch(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		record: Partial<T>,
		opts: ModelFetchOptions_T = {}
	): Promise<T | null> {
		const { query } = opts;
		const dbQuery = query || db.query.bind(db);
		const keys: ModelField_T<T>[] = Object.keys(record) as ModelField_T<
			T
		>[];
		if (!keys.length) {
			throw new Error("No filters supplied to fetch.");
		}
		let params: JSONValue_T[] = [this.table as JSONValue_T];
		for (const key of keys) {
			params.push(key);
			if (record[key] !== null) {
				if (Array.isArray(record[key])) {
					params = [
						...params,
						...((record[key] as unknown) as JSONValue_T[]),
					];
				} else {
					params.push((record[key] as unknown) as JSONValue_T);
				}
			}
		}
		const results = await dbQuery(
			`
			select * from ?? where
			${keys
				.map((k) => {
					if (record[k] === null) {
						return "?? IS NULL";
					}
					if (Array.isArray(record[k])) {
						return `?? IN (${((record[
							k
						] as unknown) as JSONValue_T[])
							.map(() => "?")
							.join(",")})`;
					}
					return "?? = ?";
				})
				.join(" and ")}
			limit 1
		`,
			params
		);

		return results.rows[0] || null;
	}
	async fetchOrThrow(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		record: Partial<T>,
		opts: ModelFetchOptions_T = {}
	): Promise<T> {
		const result = await this.fetch(record, opts);
		if (!result) {
			throw new NotFound(`RECORD_NOT_FOUND_${record[this.getIdField()]}`);
		}
		return result;
	}
}
