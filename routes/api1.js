'use strict';
var express = require('express');
var router = express.Router();
var config = require('../lib/config');
var passport = require('passport');
var _ = require('lodash');

router.get('/auth/:type/login', function(req, res, next) {
	var type = req.params.type.toLowerCase();
	if(!config.auth || !_.isObject(config.auth)) {
		return res.send(500).json({
			message: 'No defined authentication methods',
			status: 500
		});
	}
	if(!config.auth.hasOwnProperty(type)) {
		return res.send(500).json({
			message: '"'+type+'" is not a valid authentication method',
			status: 400
		});
	}

	passport.authenticate(
		type,
		{
			scope: config.auth[type].scope
		}
	);
});

router.get('/auth/:type/register', function(req, res, next) {

});

module.exports = router;
