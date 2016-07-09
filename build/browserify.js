let browserify = require('browserify');
let babelify = require('babelify');
let minifyify = require('minifyify');
let utils = require('./utils');
let path = require('path');
let fs = require('fs');
let _ = require('lodash');
let chokidar = require('chokidar');
let config = require('../lib/config');
const CLIENT_JS_DIR = path.join(config.root, 'public', 'scripts');

module.exports = function(files, minify, watch, cb) {
	let cbCalled = false;	
	let b = browserify({
		entries: files,
		deps: true,
		debug: true
	})
	.transform(babelify, {presets: ['es2015', 'react']});
	if(minify) {
		b.plugin(minifyify, {
			map: 'bundle.min.js.map',
			output: path.join(CLIENT_JS_DIR, 'bundle.min.js.map')
		});
	}

	scriptyChange();

	if(watch) {
		let chokidarConf = {
			usePolling: config.build.watching.poll,
			ignoreInitial: true,
			ignored: path.join(CLIENT_JS_DIR, 'bundle.*')
		};
		if(config.build.watching.poll) {
			chokidarConf.interval = config.build.watching.interval || 100;
		}
		chokidar.watch(`${CLIENT_JS_DIR}/**/*.js`, chokidarConf).on('add', scriptyChange);
		chokidar.watch(`${CLIENT_JS_DIR}/**/*.js`, chokidarConf).on('change', scriptyChange);
	}

	function scriptyChange(file) {
		let writeStream = fs.createWriteStream(path.join(config.root, 'public', 'scripts', minify ? 'bundle.min.js' : 'bundle.js'));

		b.bundle()
		.on('error', function(err) {
			utils.error('Browserify', err.toString(), err.filename || 'unknown', err.loc ? err.loc.line || 'unknown' : 'unknown');
		})
		.on('end', function() {
			if(file) {
				utils.log('Browserify', `${file.substr(config.root.length+1)} changed. Bundle successful.`, 'success');
			}
			else {
				utils.log('Browserify', 'Bundle successful.', 'success');
			}
			if(!cbCalled && cb && _.isFunction(cb)) {
				cb();
				cbCalled = true;
			}
		})
		.pipe(writeStream);
	}
	
};