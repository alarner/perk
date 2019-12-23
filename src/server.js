const bodyParser = require('koa-bodyparser');
const Koa = require('koa');

const HTTPError = require('./HTTPError');
const bootstrap = require('./bootstrap');


module.exports = async config => {
	const { handleRequest } = await bootstrap(config);

	// Start the server
	const app = new Koa();
	app.use(bodyParser({ enableTypes: ['json'] }));
	app.use(async ctx => {
		try {
			ctx.body = await handleRequest(
				ctx.request.method,
				ctx.request.url,
				ctx.request.body,
				ctx.request.header
			);
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
