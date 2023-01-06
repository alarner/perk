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
		rawBody: string,
		headers: IncomingHttpHeaders
	) => Promise<unknown>;
}

export interface Server_T {
	app: Koa<Koa.DefaultState, Koa.DefaultContext>;
	instance: Server;
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

export type Method_T = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RouteMetadata_T<T extends Context> {
	method: Method_T;
	pattern: string;
	keys: Key[];
	regexp: RegExp;
	fns: RouteHandler_T<T>[];
	middleware: RouteHandler_T<T>[];
}

export type ParsedUrlQuery_T = querystring.ParsedUrlQuery;

export interface Context<B = JSONObject_T> {
	query: ParsedUrlQuery_T;
	params: StringValueObject_T;
	body: B;
	headers: StringValueObject_T;
	rawBody: string;
}

export type RouteHandler_T<T extends Context> = (
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
	patch: (
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
		rawBody: string,
		headers: StringValueObject_T
	) => Promise<unknown>;
}
