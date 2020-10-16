import { Config_T } from "./types";
const path = require("path");

export const configBuilder = (config: Config_T) => {
	if (!config.routes || !config.routes.directory) {
		throw new Error("config.routes.directory is required");
	}

	const rootDir = path.dirname(require.main.filename);

	if (!path.isAbsolute(config.routes.directory)) {
		config.routes.directory = path.join(rootDir, config.routes.directory);
	}

	if (
		config.public &&
		config.public.directory &&
		!path.isAbsolute(config.routes.directory)
	) {
		config.public.directory = path.join(rootDir, config.public.directory);
	}
	return config;
};
