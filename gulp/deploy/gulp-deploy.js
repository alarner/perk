/*eslint strict:0 */
'use strict';
let gutil = require('gulp-util');
let digitalocean = require('./adapters/digitalocean');

module.exports = function(config, configTemplate, pjson) {
	return function() {
		let env = process.argv.length >= 4 ? process.argv[3].substr(6) : 'default';
		if(!config.deploy || !config.deploy.hasOwnProperty(env)) {
			gutil.log(gutil.colors.red('Could not find environment'), gutil.colors.yellow(env), gutil.colors.red('in config file'));
			gutil.beep();
			return;
		}
		else {
			gutil.log(gutil.colors.green('Deploying to'), env);
		}

		let deployConfig = config.deploy[env];
		if(deployConfig.type.toLowerCase() === 'digitalocean') {
			return digitalocean(pjson, deployConfig, configTemplate);
		}
		else {
			gutil.log(gutil.colors.red('Could not deployment adapter for type'), gutil.colors.yellow(deployConfig.type));
			gutil.beep();
			return;
		}
	};
};