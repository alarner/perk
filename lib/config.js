/*eslint strict:0 */
'use strict';
let configLoader = require('config-loader');
let path = require('path');
let config = configLoader(path.join(__dirname, '../config'));
let url = require('url');
if(!config.webserver.hostname) {
	console.warn('A hostname must be specified in config/webserver.js');
}
else if(config.webserver.ssl && (!config.webserver.ssl.port || !config.webserver.ssl.keyPath || !config.webserver.ssl.certPath)) {
	console.warn('When using https you must provide a ssl.port, ssl.keyPath and ssl.certPath in config/webserver.js');
}
else {
	config.webserver.port = config.webserver.port || 3000;
	config.webserver.baseUrl = url.format({
		protocol: config.webserver.ssl ? 'https' : 'http',
		hostname: config.webserver.hostname,
		port: config.webserver.ssl ? config.webserver.ssl.port : config.webserver.port.http
	});
}
module.exports = config;