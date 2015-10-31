let express = require('express');
let router = express.Router();
let config = require('../lib/config');
let passport = require('passport');
let validateAuthType = require('../lib/middleware/validate-auth-type');

router.get('/:type/login', validateAuthType, function(req, res, next) {
	passport.authenticate(
		req.params.type,
		{
			scope: config.auth[req.params.type].scope || []
		}
	)(req, res, next);
});

router.get('/:type/callback', validateAuthType, function(req, res, next) {
	passport.authenticate(
		req.params.type,
		{ 
			successRedirect: '/auth/google/success',
			failureRedirect: '/auth/google/failure'
		}
	)(req, res, next);
});

router.get('/:type/register', function(req, res, next) {

});

module.exports = router;
