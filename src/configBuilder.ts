import { Config_T } from "./types";
import path from "path";

export const configBuilder = (config: Config_T): Config_T => {
	if (!config.routes || !config.routes.directory) {
		throw new Error("config.routes.directory is required");
	}

	if (!path.isAbsolute(config.routes.directory)) {
		config.routes.directory = path.join(
			config.rootDirectory,
			config.routes.directory
		);
	}

	if (
		config.public &&
		config.public.directory &&
		!path.isAbsolute(config.routes.directory)
	) {
		config.public.directory = path.join(
			config.rootDirectory,
			config.public.directory
		);
	}

	if (config.server && !config.server.index) {
		config.server.index = "index";
	}
	return config;
};
