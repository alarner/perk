/*eslint strict:0 */
'use strict';
let bunyan = require('bunyan');
let configLoader = require('config-loader');
let path = require('path');
let config = configLoader(path.join(__dirname, '../config'));
module.exports = bunyan.createLogger(config.logging);