import fs from "fs";
import path from "path";
import url from "url";
import querystring from "querystring";

import { Key, pathToRegexp } from "path-to-regexp";

import * as HTTPError from "./HTTPError";
import { configBuilder } from "./configBuilder";
import {
	Bootstrap_T,
	Config_T,
	Context,
	JSONObject_T,
	Method_T,
	RouteMetadata_T,
	StringValueObject_T,
} from "./types";

export const bootstrap = async <T extends Context>(
	config: Config_T
): Promise<Bootstrap_T> => {
	// Validate config and fix paths
	config = configBuilder(config);

	// Load all routes
	let routePaths: string[] = [];
	try {
		routePaths = await fs.promises.readdir(config.routes.directory);
	} catch (error) {
		if (error.code === "ENOENT") {
			throw new Error(
				`The routes directory does not exist: "${config.routes.directory}"`
			);
		}
		throw error;
	}
	if (config.routes.excludeRegex) {
		const excludeRegex = new RegExp(config.routes.excludeRegex);
		routePaths = routePaths.filter((path) => {
			return !path.match(excludeRegex);
		});
	}

	const routes: RouteMetadata_T<T>[] = [];
	for (const routePath of routePaths) {
		if (routePath.match("^.+.m?[jt]s")) {
			const route = routePath.substr(0, routePath.length - 3);
			// We need to be able to dynamically require the route files
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			let endpoints = require(path.join(
				config.routes.directory,
				routePath
			));
			// If the route uses export we need to pull default property from it
			if (endpoints.default) {
				endpoints = endpoints.default;
			}
			const middleware = endpoints.middleware || [];
			const keys = Object.keys(endpoints).filter(
				(k) => k !== "middleware"
			);
			for (const key of keys) {
				const [method, subPattern] = key.split(" ");
				if (
					!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)
				) {
					throw new Error(
						`Endpoint "${key}" in route "${routePath}" does not start with a valid request type (GET, POST, PUT, PATCH or DELETE)`
					);
				}
				const modifiedRoute =
					route === config.server.index ? "" : route;
				const pattern =
					subPattern === "/"
						? `/${modifiedRoute}`
						: `/${modifiedRoute}${subPattern}`;
				const keys: Key[] = [];
				const regexp = pathToRegexp(pattern, keys);
				const fns = Array.isArray(endpoints[key])
					? endpoints[key]
					: [endpoints[key]];
				routes.push({
					method: method as Method_T,
					pattern,
					regexp,
					keys,
					fns,
					middleware,
				});
			}
		}
	}

	return {
		async handleRequest(
			method: Method_T,
			requestUrl: string,
			body: JSONObject_T,
			headers: StringValueObject_T
		): Promise<unknown> {
			const { pathname, query } = url.parse(requestUrl);
			const parsedQuery = querystring.parse(query);
			let matchedRoute = null;
			let match = null;
			for (const route of routes) {
				if (route.method === method.toUpperCase()) {
					match = route.regexp.exec(pathname);
					if (match) {
						matchedRoute = route;
						break;
					}
				}
			}
			if (match && matchedRoute) {
				const params: StringValueObject_T = {};
				for (let i = 0; i < matchedRoute.keys.length; i++) {
					params[matchedRoute.keys[i].name] = match[i + 1];
				}
				const context = {
					query: parsedQuery,
					params,
					body,
					headers,
				};
				let result = null;

				for (const fn of matchedRoute.middleware) {
					result = await fn(context as T);
				}
				for (const fn of matchedRoute.fns) {
					result = await fn(context as T);
				}
				return result;
			} else {
				if (config.public && config.public.directory) {
					try {
						let p = path.join(config.public.directory, pathname);
						let stat = await fs.promises.stat(p);
						if (!stat.isDirectory()) {
							return fs.createReadStream(p);
						} else {
							p = path.join(p, "index.html");
							stat = await fs.promises.stat(p);
							return fs.createReadStream(p);
						}
					} catch (error) {
						if (!["ENOENT"].includes(error.code)) {
							throw error;
						}
					}
				}
				throw new HTTPError.NotFound("NOT_FOUND");
			}
		},
		config,
	};
};
