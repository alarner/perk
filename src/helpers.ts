import querystring from "querystring";
import { bootstrap, db } from "./index";
import {
	Config_T,
	JSONValue_T,
	StringValueObject_T,
	TestHelpers_T,
} from "./types";

export const bootstrapTests = async (
	config: Config_T
): Promise<TestHelpers_T> => {
	const { handleRequest } = await bootstrap(config);

	return {
		db: db.client,
		handleRequest,
		disconnectDb(): Promise<void> {
			return db.disconnect();
		},
		async resetDb(): Promise<void> {
			await db.query(`
				DO $$ DECLARE
					r RECORD;
				BEGIN
					-- if the schema you operate on is not "current", you will want to
					-- replace current_schema() in query with 'schematodeletetablesfrom'
					-- *and* update the generate 'DROP...' accordingly.
					FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
						EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
					END LOOP;
				END $$;
			`);
		},
		async get(
			path: string,
			query: StringValueObject_T = {},
			headers: StringValueObject_T = {}
		): Promise<unknown> {
			const result = await handleRequest(
				"GET",
				`${path}?${querystring.stringify(query)}`,
				{},
				headers
			);
			return JSON.parse(JSON.stringify(result));
		},
		async post(
			path: string,
			body: JSONValue_T = {},
			headers: StringValueObject_T = {}
		): Promise<unknown> {
			const result = await handleRequest("POST", path, body, headers);
			return JSON.parse(JSON.stringify(result));
		},
		async put(
			path: string,
			body: JSONValue_T = {},
			headers: StringValueObject_T = {}
		): Promise<unknown> {
			const result = await handleRequest("PUT", path, body, headers);
			return JSON.parse(JSON.stringify(result));
		},
		async delete(
			path: string,
			body: JSONValue_T = {},
			headers: StringValueObject_T = {}
		): Promise<unknown> {
			const result = await handleRequest("DELETE", path, body, headers);
			return JSON.parse(JSON.stringify(result));
		},
	};
};
