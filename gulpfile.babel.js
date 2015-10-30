'use strict';

var fork = require('child_process').fork;

var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var strictify = require('strictify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var async = require('async');


function bundle(b) {
	b.transform(babelify);
	b.transform(strictify);
	b.on('log', (message) => {
		gutil.log(gutil.colors.green('Browserify'), message);
	});
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
};

var dirs = {
	app: [
		'views/{,*/}*.ejs',
		'routes/{,*/}*.js',
		'models/{,*/}*.js',
		'lib/{,*/}*.js',
		'config/{,*/}*.js',
		'app.js',
	]
};

var app = {
	instance: {},

	path: './bin/www',

	env: { NODE_ENV: 'development', port: 3000 },

	start: function( callback ) {
		// process.execArgv.push( '--harmony' );

		app.instance = fork( app.path, { silent: true, env: app.env } );
		app.instance.stdout.pipe( process.stdout );
		app.instance.stderr.pipe( process.stderr );

		gutil.log( gutil.colors.cyan( 'Starting' ), 'express server ( PID:', app.instance.pid, ')' );

		if( callback ) callback();
	},

	stop: function( callback ) {
		if( app.instance.connected ) {
			app.instance.on( 'exit', function() {
				gutil.log( gutil.colors.red( 'Stopping' ), 'express server ( PID:', app.instance.pid, ')' );
				if( callback ) callback();
			});
			return app.instance.kill( 'SIGINT' );
		}
		if( callback ) callback();
	},

	restart: function( event ) {
		async.series([
			app.stop,
			app.start,
		]);
	},
};

gulp.task('watchify', function() {
	var b = browserify({
		cache: {},
		packageCache: {},
		plugin: [watchify],
		entries: ['./public/scripts/main.js'],
	});
	b.on('update', bundle.bind(this, b));
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
	gulp.watch('public/styles/**/*.{scss,sass}', ['serve-sass']);
});