let express = require('express');
let router = express.Router();
let config = require('../lib/config');
let passport = require('passport');
let validator = require('validator');
let includeAll = require('include-all');
let validateAuthType = require('../lib/middleware/validate-auth-type');
let validateAuthProfile = require('../lib/middleware/validate-auth-profile');
let authenticator = require('../lib/auth/authenticator');
let adapters = includeAll({
	dirname: __dirname + '/../lib/auth/adapters',
	filter: /(.+)\.js$/
});

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
			successRedirect: '/auth/'+req.params.type+'/success',
			failureRedirect: '/auth/'+req.params.type+'/failure'
		}
	)(req, res, next);
});

router.get('/:type/register', function(req, res, next) {

});

router.get('/email', validateAuthProfile, function(req, res) {
	if(!req.session.hasOwnProperty('_auth_profile')) {
		return res.redirect('/auth/error');
	}
	if(req.session._auth_profile.email) {
		return res.redirect('/auth/finish');
	}
	res.render('auth/email');
});

router.post('/email', validateAuthProfile, function(req, res, next) {
	if(!req.body.email) {
		req.flash('email', 'Please enter your email address');
	}
	if(!validator.isEmail(req.body.email)) {
		req.flash('email', 'It looks like there\'s somthing wrong with that email address');
	}
	if(req.session._flash_messages.email) {
		return res.redirect('/auth/email');
	}
	req.session._auth_profile.email = req.body.email;
	let authCallback = authenticator(req, req.session._auth_profile, req.session._auth_type, function(err, authModel) {
		console.log(err, authModel);
	});

});

router.get('/finish', function(req, res, next) {

});

module.exports = router;
