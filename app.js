let config = require('./lib/config');

global.knex = require('knex')(config.database);
global.bookshelf = require('bookshelf')(global.knex);
bookshelf.plugin('registry');

let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let howhap = require('howhap-middleware');
let RedisStore = require('connect-redis')(session);
let _ = require('lodash');
let flash = require('./lib/middleware/flash-messages');
let versions = require('./lib/middleware/versions');
let passportSetup = require('./lib/auth/passport-setup');

// let favicon = require('serve-favicon');
// let logger = require('morgan');

let app = express();

let sessionConfig = _.extend({}, config.session, {store: new RedisStore(config.session.store || {})});
app.use(session(sessionConfig));
app.use(howhap({
	availableErrors: config.errors,
	logging: config.logging
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash);
app.use(versions);
passportSetup(app);

/*******************************/
/*                             */
/*            ROUTES           */
/*                             */
/*******************************/

/* 1. ROUTES are loaded here */

// let api = require('./routes/api1');
let index = require('./routes/index');
let auth = require('./routes/auth');

/* 2. ROUTES are added here */

// app.use('/api/v1/', api);
app.use('/auth', auth);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
