/*eslint strict:0 */
'use strict';
let configLoader = require('config-loader');
let path = require('path');
let config = configLoader(path.join(__dirname, '../config'));
let url = require('url');
let logger = require('./logger');
let includeAll = require('include-all');
if(!config.webserver.hostname) {
	logger.fatal('A hostname must be specified in config/webserver.js');
	process.exit(1);
}
else if(config.webserver.https && (!config.webserver.https.port || !config.webserver.https.keyPath || !config.webserver.https.certPath)) {
	logger.fatal('When using https you must provide a https.port, https.keyPath and https.certPath in config/webserver.js');
	process.exit(1);
}
else {
	let port = 3000;
	if(config.webserver.https) {
		port = config.webserver.https.port;
		if(!path.isAbsolute(config.webserver.https.keyPath)) {
			config.webserver.https.keyPath = path.join(__dirname, '..', config.webserver.https.keyPath);
		}
		if(!path.isAbsolute(config.webserver.https.certPath)) {
			config.webserver.https.certPath = path.join(__dirname, '..', config.webserver.https.certPath);
		}
	}
	else if(config.webserver.http && config.webserver.http.port) {
		port = config.webserver.http.port;
	}
	config.webserver.port = port;
	config.webserver.baseUrl = url.format({
		protocol: config.webserver.https ? 'https' : 'http',
		hostname: config.webserver.hostname,
		port: port === 80 || port === 434 ? null : port
	});
}

config.errors = includeAll({
	dirname: path.join(__dirname, '..', 'errors'),
	filter:  /(.+)\.js$/
});

config.env = process.env.NODE_ENV || 'development';

module.exports = config;