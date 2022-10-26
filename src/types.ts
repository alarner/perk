import { Options } from "@koa/cors";
import { IncomingHttpHeaders, Server } from "http";
import { Key } from "path-to-regexp";
import Koa from "koa";
import querystring from "querystring";

export type JSONPrimitive_T = string | number | boolean | null;
export type JSONValue_T = JSONPrimitive_T | JSONObject_T | JSONArray_T;
export type JSONObject_T = { [member: string]: JSONValue_T };
export type JSONArray_T = Array<JSONValue_T>;

export interface StringValueObject_T {
	[key: string]: string;
}

export interface Bootstrap_T {
	config: Config_T;
	handleRequest: (
		method: Method_T,
		requestUrl: string,
		body: JSONValue_T,
		headers: IncomingHttpHeaders
	) => Promise<unknown>;
}

export interface Server_T {
	app: Koa<Koa.DefaultState, Koa.DefaultContext>;
	instance: Server;
}

export interface ModelRecord_T {
	id: string;
	created_at: string;
	updated_at: string;
}

export interface Config_T {
	rootDirectory: string;
	routes: {
		directory: string;
		excludeRegex?: string;
	};
	public?: {
		directory: string;
	};
	server?: {
		url: string;
		cors?: Options;
		debug?: boolean;
		port?: number;
		index?: string;
	};
}

export type Method_T = "GET" | "POST" | "PUT" | "DELETE";

export interface RouteMetadata_T<T extends Context_T> {
	method: Method_T;
	pattern: string;
	keys: Key[];
	regexp: RegExp;
	fns: RouteHandler_T<T>[];
	middleware: RouteHandler_T<T>[];
}

export type ParsedUrlQuery_T = querystring.ParsedUrlQuery;

export interface Context_T {
	query: ParsedUrlQuery_T;
	params: StringValueObject_T;
	body: JSONObject_T;
	headers: StringValueObject_T;
}

export type RouteHandler_T<T extends Context_T> = (
	context: T
) => Promise<JSONValue_T>;

export interface ModelMethods_T {
	[key: string]: () => unknown;
}

export interface TestRequest_T {
	get: (
		path: string,
		query?: StringValueObject_T,
		headers?: StringValueObject_T
	) => Promise<unknown>;
	post: (
		path: string,
		body?: JSONValue_T,
		headers?: StringValueObject_T
	) => Promise<unknown>;
	put: (
		path: string,
		body?: JSONValue_T,
		headers?: StringValueObject_T
	) => Promise<unknown>;
	delete: (
		path: string,
		body?: JSONValue_T,
		headers?: StringValueObject_T
	) => Promise<unknown>;
}

export interface TestHelpers_T extends TestRequest_T {
	handleRequest: (
		method: Method_T,
		requestUrl: string,
		body: StringValueObject_T,
		headers: StringValueObject_T
	) => Promise<unknown>;
}
