import fs from "fs";
import path from "path";
import url from "url";
import querystring from "querystring";

import { Key, pathToRegexp } from "path-to-regexp";

import * as HTTPError from "./HTTPError";
import { db } from "./db";
import { configBuilder } from "./configBuilder";
import { Config_T, GenericObject_T, Method_T, RouteMetadata_T } from "./types";

export const bootstrap = async (config: Config_T) => {
	// Validate config and fix paths
	config = configBuilder(config);

	if (config.database) {
		db.connect(config.database);
	}

	// Load all routes
	const routePaths = await fs.promises.readdir(config.routes.directory);
	const routes: RouteMetadata_T[] = [];
	for (const routePath of routePaths) {
		if (routePath.endsWith(".js")) {
			const route = routePath.substr(0, routePath.length - 3);
			const endpoints = require(path.join(
				config.routes.directory,
				routePath
			));
			for (const key in endpoints) {
				const [method, subPattern] = key.split(" ");
				if (!["GET", "POST", "PUT", "DELETE"].includes(method)) {
					throw new Error(
						`Endpoint "${key}" in route "${routePath}" does not start with a valid request type (GET, POST, PUT or DELETE)`
					);
				}
				const pattern =
					subPattern === "/" ? `/${route}` : `/${route}${subPattern}`;
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
				});
			}
		}
	}

	return {
		async handleRequest(
			method: Method_T,
			requestUrl: string,
			body: GenericObject_T,
			headers: GenericObject_T
		) {
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
				const params: GenericObject_T = {};
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

				for (const fn of matchedRoute.fns) {
					result = await fn(context);
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
