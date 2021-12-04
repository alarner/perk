import fs from "fs";
import path from "path";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import Koa from "koa";
import mime from "mime-types";

import { HTTPRedirect } from "./HTTPRedirect";
import { Config_T, Context_T, Method_T, Server_T } from "./types";
import { bootstrap } from "./bootstrap";

export const server = async <T extends Context_T>(
	config: Config_T
): Promise<Server_T> => {
	const { handleRequest } = await bootstrap<T>(config);

	// Start the server
	const app = new Koa();
	app.use(bodyParser({ enableTypes: ["json"] }));
	if (config?.server?.cors) {
		app.use(cors(config.server.cors));
	}
	app.use(async (ctx) => {
		try {
			const result = await handleRequest(
				ctx.request.method as Method_T,
				ctx.request.url,
				ctx.request.body,
				ctx.request.header
			);
			if (result instanceof HTTPRedirect) {
				ctx.status = result.status;
				ctx.redirect(result.location);
			} else if (result instanceof fs.ReadStream) {
				ctx.type =
					mime.contentType(path.basename(result.path.toString())) ||
					"";
				ctx.body = result;
			} else {
				ctx.body = result;
			}
		} catch (error) {
			if (error.isHTTPError) {
				ctx.response.status = error.status;
				ctx.body = { code: error.message };
			} else {
				if (config.server.debug) {
					// eslint-disable-next-line no-console
					console.error(error);
				}
				ctx.response.status = 500;
				ctx.body = { code: "INTERNAL_SERVER_ERROR" };
			}
		}
	});
	const instance = app.listen((config.server && config.server.port) || 3000);
	return { app, instance };
};
