'use strict';
var configLoader = require('config-loader');
var path = require('path');
var config = configLoader(path.join(__dirname, '../config'));
module.exports = config;