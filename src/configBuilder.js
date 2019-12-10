const path = require('path');
const getStack = require('./getStack');

module.exports = config => {
	if(!config.routes || !config.routes.directory) {
		throw new Error('config.routes.directory is required');
	}

	const callFile = getStack()[0].getFileName();
	const perkSrcDir = path.dirname(callFile);
	const rootDir = path.join(perkSrcDir, '..', '..', '..');

	if(!path.isAbsolute(config.routes.directory)) {
		config.routes.directory = path.join(rootDir, config.routes.directory);
	}

	if(config.database) {
		if(!config.database.migrations || !config.database.migrations.directory) {
			throw new Error('config.database.migrations.directory is required');
		}

		if(!path.isAbsolute(config.database.migrations.directory)) {
			config.database.migrations.directory = path.join(
				rootDir,
				config.database.migrations.directory
			);
		}

		if(!config.database.migrations.stub) {
			config.database.migrations.stub = path.join(perkSrcDir, 'migrationTemplate.js');
		}
	}
	return config;
};
