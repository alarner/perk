let browserify = require('browserify');
let babelify = require('babelify');
let strictify = require('strictify');
let minifyify = require('minifyify');
let utils = require('./utils');
let path = require('path');
let fs = require('fs');
let _ = require('lodash');
let chokidar = require('chokidar');
let config = require('../lib/config');
const CLIENT_JS_DIR = path.join(config.root, 'public', 'scripts');

module.exports = function(files, minify, watch, cb) {	
	let b = browserify({
		entries: files,
		deps: true,
		debug: true
	})
	.transform(babelify, {presets: ['es2015', 'react']})
	.transform(strictify);
	if(minify) {
		b.plugin(minifyify, {
			map: 'bundle.min.js.map',
			output: path.join(CLIENT_JS_DIR, 'bundle.min.js.map')
		});
	}

	scriptyChange();

	if(watch) {
		chokidar.watch(`${CLIENT_JS_DIR}/**/*.js`, {ignoreInitial: true, ignored: path.join(CLIENT_JS_DIR, 'bundle.*')}).on('add', scriptyChange);
		chokidar.watch(`${CLIENT_JS_DIR}/**/*.js`, {ignoreInitial: true, ignored: path.join(CLIENT_JS_DIR, 'bundle.*')}).on('change', scriptyChange);
	}

	function scriptyChange(file) {
		let writeStream = fs.createWriteStream(path.join(config.root, 'public', 'scripts', minify ? 'bundle.min.js' : 'bundle.js'));

		b.bundle()
		.on('error', function(err) {
			// console.log(err);
			utils.error('Browserify', err.toString(), err.filename || 'unknown', err.loc ? err.loc.line || 'unknown' : 'unknown');
		})
		.on('end', function() {
			if(file) {
				utils.log('Browserify', `${file.substr(config.root.length+1)} changed. Bundle successful.`, 'success');
			}
			else {
				utils.log('Browserify', 'Bundle successful.', 'success');
			}
			if(cb && _.isFunction(cb)) {
				cb(err, stats);
			}
		})
		.pipe(writeStream);
	}
	
};