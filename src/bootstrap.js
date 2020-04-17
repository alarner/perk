const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const { pathToRegexp } = require('path-to-regexp');

const HTTPError = require('./HTTPError');
const db = require('./db');
const configBuilder = require('./configBuilder');

module.exports = async config => {
	// Validate config and fix paths
	config = configBuilder(config);

	if(config.database) {
		db.connect(config.database);
	}

	// Load all routes
	const routePaths = await fs.readdir(config.routes.directory);
	const routes = [];
	for(const routePath of routePaths) {
		if(routePath.endsWith('.js')) {
			const route = routePath.substr(0, routePath.length - 3);
			const endpoints = require(path.join(config.routes.directory, routePath));
			for(const key in endpoints) {
				const [method, subPattern] = key.split(' ');
				if(!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
					throw new Error(`Endpoint "${key}" in route "${routePath}" does not start with a valid request type (GET, POST, PUT or DELETE)`);
				}
				const pattern = subPattern === '/' ? `/${route}` : `/${route}${subPattern}`;
				const keys = [];
				const regexp = pathToRegexp(pattern, keys);
				const fns = Array.isArray(endpoints[key]) ? endpoints[key] : [ endpoints[key] ];
				routes.push({ method, pattern, regexp, keys, fns });
			}
		}
	}

	return {
		async handleRequest(method, requestUrl, body, headers) {
			const { pathname, query } = url.parse(requestUrl);
			const parsedQuery = querystring.parse(query);
			let matchedRoute = null;
			let match = null;
			for(const route of routes) {
				if(route.method === method.toUpperCase()) {
					match = route.regexp.exec(pathname);
					if(match) {
						matchedRoute = route;
						break;
					}
				}
			}
			if(match && matchedRoute) {
				const params = {};
				for(let i=0; i<matchedRoute.keys.length; i++) {
					params[matchedRoute.keys[i].name] = match[i+1];
				}
				const context = {
					query: parsedQuery,
					params,
					body,
					headers
				};
				let result = null;

				for(const fn of matchedRoute.fns) {
					result = await fn(context);
				}
				return result;
			}
			else {
				throw new HTTPError.NotFound('NOT_FOUND');
			}
		},
		config
	}
};
