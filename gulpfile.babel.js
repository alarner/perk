/*eslint strict:0 */
'use strict';
let fork = require('child_process').fork;

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

let config = require('./lib/config');
let pjson = require('./package.json');
let configTemplate = require('./config/local.template');

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

gulp.task('watchify', function() {
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

gulp.task('sass', function() {
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