/*eslint strict:0 */
'use strict';
let fork = require('child_process').fork;
let fs = require('fs');
let path = require('path');

let gulp = require('gulp');
let gutil = require('gulp-util');
let rename = require('gulp-rename');
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps');

let watchify = require('watchify');
let browserify = require('browserify');
let babelify = require('babelify');
let strictify = require('strictify');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');
let async = require('async');
let _ = require('lodash');
let configTemplate = require('config-template');

let config = require('./lib/config');
let pjson = require('./package.json');

function bundle(b) {
	b.bundle()
	.on('error', (err) => {
		gutil.log(gutil.colors.red('Browserify'), err.toString());
		gutil.beep();
	})
	.pipe(source('bundle.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./public/scripts'));
}

let dirs = {
	app: [
		'views/**/*.ejs',
		'routes/**/*.js',
		'models/**/*.js',
		'lib/**/*.js',
		'config/**/*.js',
		'app.js'
	]
};

let app = {
	instance: {},

	path: './bin/www',

	env: _.extend({}, process.env, { NODE_ENV: 'development', port: 3000 }),

	start: function( callback ) {
		process.execArgv.push('--use_strict');

		app.instance = fork( app.path, { silent: true, env: app.env } );
		app.instance.stdout.pipe( process.stdout );
		app.instance.stderr.pipe( process.stderr );

		gutil.log( gutil.colors.cyan( 'Starting' ), 'express server ( PID:', app.instance.pid, ')' );

		if( callback ) {
			callback();
		}
	},

	stop: function( callback ) {
		if( app.instance.connected ) {
			app.instance.on( 'exit', function() {
				gutil.log( gutil.colors.red( 'Stopping' ), 'express server ( PID:', app.instance.pid, ')' );
				if( callback ) {
					callback();
				}
			});
			return app.instance.kill( 'SIGINT' );
		}
		if( callback ) {
			callback();
		}
	},

	restart: function( event ) {
		async.series([
			app.stop,
			app.start
		]);
	}
};

gulp.task('watchify', ['config'], function() {
	let b = browserify({
		cache: {},
		packageCache: {},
		plugin: [watchify],
		debug: true,
		entries: ['./public/scripts/main.js']
	});
	b.on('log', (message) => {
		gutil.log(gutil.colors.green('Browserify'), message);
	});
	b.on('update', bundle.bind(this, b));
	b.transform(babelify, {presets: ['es2015', 'react']});
	b.transform(strictify);
	bundle(b);
});

gulp.task('server', ['watchify', 'sass'], app.start);

gulp.task('sass', ['config'], function() {
	return gulp.src('public/styles/**/*.{scss,sass}')
	.pipe(rename(function(p) {
		p.basename += p.extname;
	}))
	.pipe(sourcemaps.init())
	.pipe(sass({
		errLogToConsole: true
	}).on('error', sass.logError))
	.pipe(sourcemaps.write('./'))
	.pipe(rename(function(p) {
		if(p.extname !== '.map') {
			p.extname = '.css';
		}
	}))
	.pipe(gulp.dest('public/styles'));
});

gulp.task('config', function(cb) {
	let localExists = false;
	async.series({
		checkLocal: function(cb) {
			fs.lstat(path.join(__dirname, 'config', 'local.js'), function(err, stat) {
				if(err) {
					cb();
				}
				else if(!stat.isFile()) {
					cb('config/local.js must be a file, not a directory.');
				}
				else {
					localExists = true;
					cb();
				}
			});
		},
		checkTemplate: function(cb) {
			if(localExists) {
				return cb();
			}
			let templatePath = path.join(__dirname, 'config', 'local.template.js');
			fs.lstat(templatePath, function(err, stat) {
				if(err) {
					cb('Unable to load local config template: '+err.toString());
				}
				else if(!stat.isFile()) {
					cb('config/local.template.js must be a file, not a directory.');
				}
				else {
					let template = require(templatePath);
					configTemplate(template)
					.then(function(config) {
						let localPath = path.join(__dirname, 'config', 'local.js');
						fs.writeFile(localPath, 'module.exports = '+JSON.stringify(config, null, '\t')+';', function(err) {
							if(err) {
								cb('There was a problem saving the local.js config file: '+err.toString());
							}
							else {
								cb();
							}
						});
					})
					.catch(function(err) {
						cb('Something went wrong while configuring the local.js file.');
					});
				}
			});
		}
	}, function(err) {
		if(err) {
			gutil.log(gutil.colors.red('config'), err);
			process.exit(1);
		}
		else {
			cb();
		}
	});
});

gulp.task('default', ['watchify', 'server', 'sass'], function() {
	gulp.watch( dirs.app, app.restart );
	gulp.watch('public/styles/**/*.{scss,sass}', ['sass']);
});

// gulp deploy
// gulp deploy --env=digitalocean
gulp.task('deploy', require('./gulp/deploy/gulp-deploy')(config, configTemplate, pjson));

gulp.task('test', function() {
	let LinuxTools = require('./gulp/deploy/linuxTools');
	let lt = new LinuxTools('root', '104.236.44.29');
	return lt.execute('gitLatestTag', '/usr/share/nginx/apps/test-app', 'git@bitbucket.org:alarner/impact-web.git')
	.then((data) => {
		console.log('got data', data);
	})
	.catch((err) => {
		console.log('caught error', err);
	});
});