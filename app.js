// let config = require('./lib/config');

let express = require('express');
let path = require('path');
let consolidate = require('consolidate');

// let favicon = require('serve-favicon');

let app = express();

// view engine setup
app.engine('html', consolidate.ejs);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res) {
	res.render('index');
});

module.exports = app;
