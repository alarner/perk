/*eslint strict:0 */
'use strict';
const winston = require('winston');
const configLoader = require('config-loader');
const path = require('path');
const config = configLoader(path.join(__dirname, '../config'));
winston.addColors(config.logging.colors || {});

module.exports =  new winston.Logger(config.logging);