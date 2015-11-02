/*eslint strict:0 */
'use strict';
let configLoader = require('config-loader');
let path = require('path');
let config = configLoader(path.join(__dirname, '../config'));
if(!config.webserver.baseUrl) {
	console.warn('A baseUrl must be specified in config/webserver.js');
}
else {
	if(config.webserver.baseUrl.charAt(config.webserver.baseUrl.length-1) === '/') {
		config.webserver.baseUrl = config.webserver.baseUrl.substr(0, config.webserver.baseUrl.length-1);
	}
}
module.exports = config;