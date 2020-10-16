import { Options } from "@koa/cors";
import { Config, Raw, Transaction } from "knex";
import { Key } from "path-to-regexp";

export interface ModelOptions_T {
	idAttribute?: string;
}

export interface ModelSaveOptions_T {
	returnNew?: boolean;
	transaction?: Transaction;
}

export interface ModelFetchOptions_T {
	transaction?: Transaction;
}

export type DbQueryFn_T = (sql: string, params: GenericObject_T) => Raw<any>;

export interface DbTransactionCallbackParams_T {
	query: DbQueryFn_T;
}

export type DbTransactionCallback_T = (
	params: DbTransactionCallbackParams_T
) => Promise<unknown>;

export interface Config_T {
	routes: {
		directory: string;
	};
	database?: Config;
	public?: {
		directory: string;
	};
	server?: {
		cors?: Options;
		debug?: boolean;
		port?: number;
	};
}

export type Method_T = "GET" | "POST" | "PUT" | "DELETE";

export interface GenericObject_T {
	[key: string]: any;
}

export interface RouteMetadata_T {
	method: Method_T;
	pattern: string;
	keys: Key[];
	regexp: RegExp;
	fns: RouteHandler_T[];
}

export interface Context_T {}

export type RouteHandler_T = (context: Context_T) => Promise<object>;

export interface ModelMethods_T {
	[key: string]: () => any;
}
