import { db } from "./db";
import {
	GenericObject_T,
	ModelFetchOptions_T,
	ModelMethods_T,
	ModelOptions_T,
	ModelSaveOptions_T,
} from "./types";

export const model = (
	table: string,
	fns: ModelMethods_T,
	options: ModelOptions_T = {}
) => {
	const idAttribute = options.idAttribute || "id";
	const updateAttribute = options.updateAttribute || "updated_at";

	const model = {
		async save(record: GenericObject_T, opts: ModelSaveOptions_T = {}) {
			const { returnNew, query } = opts;
			const dbQuery = query || db.query.bind(db);
			const keys = Object.keys(record).filter((k) => k !== idAttribute);
			if (!keys.length) {
				throw new Error("Record has nothing new to save.");
			}

			let id = record[idAttribute];

			if (record[idAttribute] !== undefined) {
				if (!record[updateAttribute]) {
					record[updateAttribute] = new Date();
					keys.push(updateAttribute);
				}
				const params = [table];
				for (const key of keys) {
					params.push(key);
					params.push(record[key]);
				}
				params.push(idAttribute);
				params.push(record[idAttribute]);
				await dbQuery(
					`update ?? set ${keys
						.map((k) => "?? = ?")
						.join(", ")} where ?? = ?`,
					params
				);
			} else {
				if (!record.created_at) {
					record.created_at = new Date();
					keys.push("created_at");
				}
				const params = [table]
					.concat(keys)
					.concat(keys.map((k) => record[k]))
					.concat(idAttribute);
				const result = await dbQuery(
					`
					insert into ?? (${keys.map((k) => "??").join(", ")})
					values (${keys.map((k) => "?").join(", ")})
					returning ??
				`,
					params
				);
				id = result.rows[0][idAttribute];
			}
			if (returnNew) {
				return this.fetch({ [idAttribute]: id }, { query });
			}
		},
		async fetch(record: GenericObject_T, opts: ModelFetchOptions_T = {}) {
			const { query } = opts;
			const dbQuery = query || db.query.bind(db);
			const keys = Object.keys(record);
			if (!keys.length) {
				throw new Error("No filters supplied to fetch.");
			}
			let params = [table];
			for (const key of keys) {
				params.push(key);
				if (record[key] !== null) {
					if (Array.isArray(record[key])) {
						params = [...params, ...record[key]];
					} else {
						params.push(record[key]);
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
							return `?? IN (${record[k]
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
		},
		...fns,
	};

	return model;
};
