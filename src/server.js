const fs = require('fs');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const Koa = require('koa');
const mime = require('mime-types');


const HTTPError = require('./HTTPError');
const HTTPRedirect = require('./HTTPRedirect');
const bootstrap = require('./bootstrap');


module.exports = async config => {
	const { handleRequest } = await bootstrap(config);

	// Start the server
	const app = new Koa();
	app.use(bodyParser({ enableTypes: ['json'] }));
	if(config.server && config.server.cors) {
		app.use(cors(config.server.cors));
	}
	app.use(async ctx => {
		try {
			const result = await handleRequest(
				ctx.request.method,
				ctx.request.url,
				ctx.request.body,
				ctx.request.header
			);
			if(result instanceof HTTPRedirect) {
				ctx.status = result.status;
				ctx.redirect(result.location);
			}
			else if(result instanceof fs.ReadStream) {
				ctx.type = mime.contentType(path.basename(result.path));
				ctx.body = result;
			}
			else {
				ctx.body = result;
			}
		}
		catch(error) {
			if(error instanceof HTTPError.HTTPError) {
				ctx.response.status = error.status;
				ctx.body = { code: error.message };
			}
			else {
				if(config.server.debug) {
					console.error(error);
				}
				ctx.response.status = 500;
				ctx.body = { code: 'INTERNAL_SERVER_ERROR' };
			}
		}
	});
	app.listen(config.server && config.server.port || 3000);
	return app;
};
