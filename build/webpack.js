let webpack = require('webpack');
let path = require('path');
let _ = require('lodash');
let utils = require('./utils');
let config = require('../lib/config');

module.exports = function(files, minify, watch, cb) {
	let cbCalled = false;

	function finish(err, stats) {
		if(err) {
			console.log(err);
			return;
		}
		let jsonStats = stats.toJson();
		if(stats.hasErrors()) {
			// console.log('errors start');
			jsonStats.errors.forEach((err, index) => {
				let lines = err.trim().split('\n');
				console.log(lines);
				let message = lines[1];
				let file = lines[0];
				let pieces = lines.pop().split(' ');
				let lineInfo = pieces[pieces.length-1];
				let line = lineInfo.split(':')[0];
				utils.error('Webpack', message, file, line);
			});
		}
		if(stats.hasWarnings()) {
			jsonStats.warnings.forEach(console.log.bind(console));
		}

		if(!jsonStats.errors.length && !jsonStats.warnings.length) {
			utils.log('Webpack', 'bundle updated', 'success');
		}

		if(!cbCalled && cb && _.isFunction(cb)) {
			cb(err, stats);
			cbCalled = true;
		}
	}

	files = files.map(file => {
		if(file.charAt(0) !== path.sep) {
			return path.join(config.root, file);
		}
		return file;
	});

	let webpackCompiler = webpack({
		entry: files,
		output: {
			path: path.join(config.root, 'public', 'scripts'),
			filename: minify ? 'bundle.min.js' : 'bundle.js'
		},
		module: {
			loaders: [
				{
					test: /\.js/,
					exclude: /node_modules/,
					loader: 'babel',
					query: {
						presets: ['es2015', 'react']
					}
				}
			],
			plugins: minify ? [
				new webpack.optimize.UglifyJsPlugin({
					compress: { warnings: false }
    			})
    		] : []
		},
		devtool: minify ? 'source-map' : 'inline-source-map',
		watchOptions: {
			poll: config.build.watching.poll ? config.build.watching.interval || 100 : undefined
		}
	});

	if(watch) {
		webpackCompiler.watch({errorDetails: true}, finish);
	}
	else {
		webpackCompiler.run(finish);
	}
};