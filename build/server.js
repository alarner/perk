let fork = require('child_process').fork;
let utils = require('./utils');
let async = require('async');
let chokidar = require('chokidar');
let path = require('path');
let fs = require('fs');
let config = require('../lib/config');

let app = {
	instance: {},

	path: './bin/www',

	env: Object.assign({}, { NODE_ENV: 'development', PORT: config.webserver.port }, process.env),

	start: function(type, file, cb) {
		process.execArgv = [ '--use_strict' ];

		app.instance = fork( app.path, { silent: true, env: app.env } );
		fs.writeFile(path.join(config.root, 'build/.pid'), app.instance.pid.toString());
		app.instance.stdout.pipe( process.stdout );
		app.instance.stderr.pipe( process.stderr );

		if(type === 'restart') {
			utils.log('Server', `restarted from file change ${file}`, 'success');
		}

		if(cb) {
			cb();
		}
	},

	stop: function(type, file, cb) {
		if(app.instance.connected) {
			app.instance.on('exit', function() {
				if(cb) {
					cb();
				}
			});
			return app.instance.kill('SIGINT');
		}
		else {
			fs.readFile(path.join(config.root, 'build/.pid'), (err, data) => {
				// todo: kill the old process
				if(cb) {
					cb();
				}
			});
		}
	},

	restart: function(type, file, cb) {
		async.series([
			cb => app.stop(type, file, cb),
			cb => app.start(type, file, cb)
		], cb);
	}
};

module.exports = function(files, cb) {
	let chokidarConf = {
		usePolling: config.build.watching.poll,
		ignoreInitial: true
	};
	if(config.build.watching.poll) {
		chokidarConf.interval = config.build.watching.interval || 100;
	}
		
	files = files.map(file => {
		return path.join(config.root, file);
	});
	chokidar.watch(files, chokidarConf).on('add', file => app.restart('restart', file));
	chokidar.watch(files, chokidarConf).on('change', file => app.restart('restart', file));
	app.restart('start', null, function() {
		cb(null, app.env);
	});
};