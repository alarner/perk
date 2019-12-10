const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const repl = require('repl');

const bodyParser = require('koa-bodyparser');
const { pathToRegexp } = require('path-to-regexp');
const Koa = require('koa');

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
				const pattern = `/${route}${subPattern}`;
				const keys = [];
				const regexp = pathToRegexp(pattern, keys);
				const fns = Array.isArray(endpoints[key]) ? endpoints[key] : [ endpoints[key] ];
				routes.push({ method, pattern, regexp, keys, fns });
			}
		}
	}

	// Start the server
	const app = new Koa();
	app.use(bodyParser({ enableTypes: ['json'] }));
	app.use(async ctx => {
		try {
			const { pathname, query } = url.parse(ctx.request.url);
			const parsedQuery = querystring.parse(query);
			let matchedRoute = null;
			let match = null;
			for(const route of routes) {
				if(route.method === ctx.request.method.toUpperCase()) {
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
					params
				};
				let result = null;

				for(const fn of matchedRoute.fns) {
					result = await fn(context);
				}
				ctx.body = result;
			}
			else {
				throw new HTTPError.NotFound('NOT_FOUND');
			}
		}
		catch(error) {
			if(error instanceof HTTPError.HTTPError) {
				ctx.response.status = error.status;
				ctx.body = { code: error.message };
			}
			else {
				ctx.response.status = 500;
				ctx.body = { code: 'INTERNAL_SERVER_ERROR' };
			}
		}
	});
	app.listen(config.port || 3000);
};
