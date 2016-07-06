let chokidar = require('chokidar');
let grapher = require('sass-graph');
let path = require('path');
let sass = require('node-sass');
let async = require('async');
let fs = require('fs');
let CleanCSS = require('clean-css');
let utils = require('./utils');
let _ = require('lodash');
let config = require('../lib/config');

module.exports = function(sassDir, minify, watch, cb) {
	// Get sass graph
	let graph = null;
	rebuildGraph();

	// Compile on start
	let initialFiles = [];
	for(let file in graph.index) {
		graph.visitAncestors(file, function(parent) {
			if(validFile(parent)) {
				initialFiles.push(parent);
			}
		});
		if(validFile(file)) {
			initialFiles.push(file);
		}
	}

	function validFile(f) {
		let hasUnderscore = path.basename(f).charAt(0) === '_';
		let exists = initialFiles.indexOf(f) !== -1;
		let inDir = f.substr(config.root.length+1, sassDir.length) === sassDir;
		return !hasUnderscore && !exists && inDir;
	}

	async.each(
		initialFiles,
		sassyChange,
		cb
	);

	// Watch for additions and changes of sass files
	if(watch) {
		let chokidarConf = {
			usePolling: config.build.watching.poll,
			ignoreInitial: true
		};
		if(config.build.watching.poll) {
			chokidarConf.interval = config.build.watching.interval || 100;
		}
		chokidar.watch(`${path.join(config.root, sassDir)}**/*.scss`, chokidarConf).on('add', rebuildGraph);
		chokidar.watch(`${path.join(config.root, sassDir)}**/*.scss`, chokidarConf).on('change', sassyChange);
	}

	function rebuildGraph(file, cb) {
		graph = grapher.parseDir(path.join(config.root, sassDir), {
			extensions: ['scss', 'sass']
		});

		if(file) {
			sassyChange(file, cb);
		}
	}

	// Process the change of a sass file
	function sassyChange(file, cb) {
		let files = [];

		if(path.basename(file).charAt(0) !== '_') {
			files.push(file);
		}

		// Get all of the files that will be effected by this change
		graph.visitAncestors(file, function(parent) {
			if(path.basename(parent).charAt(0) !== '_') {
				files.push(parent);
			}
		});

		// Compile each relevant sass file
		async.each(
			files,
			function(f, cb) {
				sass.render(
					{
						file: f,
						sourceMap: true,
						outFile: f+'.css',
						sourceMapContents: true
					},
					function(err, result) {
						if(err) {
							return cb(err);
						}
						// Save the compiled file and sourcemap
						let files = [];
						if(minify) {
							files = [cb => fs.writeFile(f+'.min.css', new CleanCSS().minify(result.css).styles, cb)];
						}
						else {
							files = [
								cb => fs.writeFile(f+'.css', result.css, cb),
								cb => fs.writeFile(f+'.css.map', result.map, cb)
							];
						}
						async.parallel(files, cb);
					}
				);
			},
			function(err) {
				if(err) {
					if(err.message && err.line && err.file) {
						return utils.error('Sass', err.message, err.file, err.line);
					}
					else {
						return utils.log(
							'Sass',
							err.toString(),
							'error'
						);
					}				
				}
				else {
					utils.log(
						'Sass',
						`Finished processing ${file.substr(config.root.length+1)} change ... ${files.length} update${files.length === 1 ? '' : 's'}`,
						'success'
					);
				}
				if(cb && _.isFunction(cb)) {
					cb(err);
				}
			}
		);
	}
};