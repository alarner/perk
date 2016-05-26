/*eslint strict:0 */
'use strict';
let winston = require('winston');
let configLoader = require('config-loader');
let path = require('path');
let config = configLoader(path.join(__dirname, '../config'));
winston.addColors(config.logging.colors || {});

module.exports =  new winston.Logger(config.logging);