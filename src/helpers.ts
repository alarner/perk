import querystring from "querystring";
import { bootstrap } from "./index";
import {
	Config_T,
	TestHelpers_T,
	StringValueObject_T,
	JSONValue_T,
} from "./types";

export const bootstrapTests = async (
	config: Config_T
): Promise<TestHelpers_T> => {
	const { handleRequest } = await bootstrap(config);

	return {
		handleRequest,
		async get(
			path: string,
			query: StringValueObject_T = {},
			headers: StringValueObject_T = {}
		): Promise<unknown> {
			const result = await handleRequest(
				"GET",
				`${path}?${querystring.stringify(query)}`,
				{},
				"",
				headers
			);
			return JSON.parse(JSON.stringify(result));
		},
		async post(
			path: string,
			body: JSONValue_T = {},
			headers: StringValueObject_T = {}
		): Promise<unknown> {
			const result = await handleRequest(
				"POST",
				path,
				body,
				JSON.stringify(body),
				headers
			);
			return JSON.parse(JSON.stringify(result));
		},
		async put(
			path: string,
			body: JSONValue_T = {},
			headers: StringValueObject_T = {}
		): Promise<unknown> {
			const result = await handleRequest(
				"PUT",
				path,
				body,
				JSON.stringify(body),
				headers
			);
			return JSON.parse(JSON.stringify(result));
		},
		async patch(
			path: string,
			body: JSONValue_T = {},
			headers: StringValueObject_T = {}
		): Promise<unknown> {
			const result = await handleRequest(
				"PATCH",
				path,
				body,
				JSON.stringify(body),
				headers
			);
			return JSON.parse(JSON.stringify(result));
		},
		async delete(
			path: string,
			body: JSONValue_T = {},
			headers: StringValueObject_T = {}
		): Promise<unknown> {
			const result = await handleRequest(
				"DELETE",
				path,
				body,
				JSON.stringify(body),
				headers
			);
			return JSON.parse(JSON.stringify(result));
		},
	};
};
