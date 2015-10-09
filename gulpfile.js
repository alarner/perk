'use strict';

var gulp    	= require( 'gulp' ),
	gutil   	= require( 'gulp-util' ),
	fork    	= require( 'child_process' ).fork,
	// tinyLr  	= require( 'tiny-lr' ),
	async   	= require( 'async' ),
	watchify	= require( 'watchify' ),
	browserify 	= require( 'browserify' ),
	babelify 	= require( 'babelify' ),
	source 		= require( 'vinyl-source-stream' ),
	buffer 		= require( 'vinyl-buffer' ),
	assign 		= require( 'lodash.assign' ),
	sourcemaps 	= require( 'gulp-sourcemaps' ),
	sass 		= require( 'gulp-sass' ),
	rename 		= require( 'gulp-rename' ),
	path 		= require( 'path' );

/*
 * SERVER
 */
var dirs = {
	app: [
		'views/{,*/}*.ejs',
		'routes/{,*/}*.js',
		'models/{,*/}*.js',
		'libs/{,*/}*.js',
		'app.js',
	],
	public: [
		'public/scripts/{,*/}*.js',
		'public/styles/{,*/}*.scss',
		'public/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
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
			// function( callback ) {
			// 	livereload.changed( event, callback );
			// }
		]);
	}
};


gulp.task( 'server', function( callback ) {
	async.series([
		app.start,
		// livereload.start
	], callback );
});


gulp.task( 'watch', function() {
	gulp.watch( dirs.app, app.restart );
	gulp.watch('public/styles/**/*.{scss,sass}', ['serve-sass']);
});

/*
 * CLIENT
 */
// add custom browserify options here
var customOpts = {
	entries: ['./public/scripts/main.js'],
	debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts).transform(babelify));
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

gulp.task('js-bundle', bundle);

function bundle() {
	return b.bundle()
	// log errors if they happen
	.on('error', function(err, test) {
		console.log('Browserify '+err.toString());
	})
	.pipe(source('bundle.js'))
	// optional, remove if you don't need to buffer file contents
	.pipe(buffer())
	// optional, remove if you dont want sourcemaps
	.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
	// Add transformation tasks to the pipeline here.
	.pipe(sourcemaps.write('./')) // writes .map file
	.pipe(gulp.dest('./public/scripts'));
}

gulp.task('serve-sass', function() {
	return gulp.src('public/styles/**/*.{scss,sass}')
	.pipe(rename(function(p) {
		p.basename += p.extname;
	}))
	.pipe(sass({
		errLogToConsole: true
	}).on('error', sass.logError))
	.pipe(rename(function(p) {
		p.extname = '.css';
	}))
	.pipe(gulp.dest(path.join('public/styles')));
});


/*
 * DEFAULT
 */
gulp.task( 'default', [ 'js-bundle', 'serve-sass', 'server', 'watch' ] );

// gulp.task('build', ['clean', 'copy', 'js', 'css', 'sass', 'images']);

// gulp.task('clean', function(cb) {
// 	var argv = validateCli();

// 	return gulp.src(argv.o, {read: false})
// 	.pipe(prompt.confirm('The output directory "'+path.join(__dirname, argv.o)+'" will be removed. Are you sure you want to do this?'))
// 	.pipe(rimraf());
// });

// gulp.task('copy', ['clean'], function() {
// 	var argv = validateCli();
// 	return gulp.src(['**/*', '!styles/**/*.scss', '!styles/**/*.sass'])
// 	.pipe(gulp.dest(argv.o));
// });

// gulp.task('js', ['copy'], function() {
// 	var argv = validateCli();

// 	var p = browserify('scripts/main.js', { debug: true })
// 	.transform(babelify)
// 	.bundle()
// 	.pipe(source('bundle.js'))
// 	.pipe(buffer())
// 	.on('error', function (err) { console.log('Error : ' + err.message); });

// 	if(argv.min) {
// 		p.pipe(uglify());
// 	}

// 	p.pipe(gulp.dest(path.join(argv.o, 'scripts')));

// 	return p;
// });

// gulp.task('css', ['copy'], function() {
// 	var argv = validateCli();

// 	if(!argv.min) {
// 		return false;
// 	}

// 	return gulp.src('styles/**/*.css')
// 	.pipe(minifyCss({compatibility: 'ie8'}))
// 	.pipe(gulp.dest(path.join(argv.o, 'styles')));
// });

// gulp.task('sass', ['copy'], function() {
// 	var argv = validateCli();

// 	var pi = gulp.src('styles/**/*.{scss,sass}')
// 	.pipe(sass({
// 		errLogToConsole: true
// 	}).on('error', sass.logError))
// 	.on('error', function(err) {
// 		console.log(err);
// 	})
// 	.pipe(rename(function(p) {
// 		p.basename += '.sass';
// 		p.extname = '.css';
// 	}));
// 	if(argv.min) {
// 		pi.pipe(minifyCss({compatibility: 'ie8'}));
// 	}
// 	pi.pipe(gulp.dest(path.join(argv.o, 'styles')));

// 	return pi;
// });

// gulp.task('images', ['copy'], function() {
// 	var argv = validateCli();

// 	if(!argv.min) {
// 		return false;
// 	}

// 	return gulp.src('images/**/*')
//     .pipe(imagemin({
//         progressive: true
//     }))
//     .pipe(gulp.dest(path.join(argv.o, 'images')));
// });

// function validateCli() {
// 	var argv = minimist(process.argv.slice(2));
// 	if(!argv.o) {
// 		throw 'You must specify and output directory for `gulp deploy`. Format: `gulp deploy -o outputdir [--minify]`';
// 	}
// 	return argv;
// }