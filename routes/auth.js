let express = require('express');
let router = express.Router();
let config = require('../lib/config');
let passport = require('passport');
let validator = require('validator');
let validateAuthType = require('../lib/middleware/validate-auth-type');
let validateAuthProfile = require('../lib/middleware/validate-auth-profile');
let validateLocalCredentials = require('../lib/middleware/validate-local-credentials');
let authenticator = require('../lib/auth/authenticator');
let AuthenticationModel = require('../models/Authentication');
let UserModel = require('../models/User');


router.use('/:type/login', validateAuthType, function(req, res, next) {
	console.log('hit route');
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
	let authCallback = authenticator(req, req.session._auth_access_token, req.session._auth_profile, req.session._auth_type, function(err, authModel) {
		console.log(err, authModel);
	});

});

router.get('/register', function(req, res, next) {
	res.render('auth/register');
});

router.get('/login', function(req, res, next) {
	res.render('auth/login');
});

router.post('/register', validateLocalCredentials, function(req, res, next) {
	let profile = {
		id: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password
	};

	UserModel
	.forge({email: req.body.email})
	.fetch()
	.then(function(auth) {
		// The account already exists, return an error.
		if(auth) {
			if(req.accepts('html')) {
				req.flash('email', 'A user with that email has already registered. Would you like to <a href="/auth/reset-password">reset your password</a>?');
				res.redirect('/auth/register');
			}
			else {
				res.status(400).json({
					message: 'A user with that email has already registered.',
					status: 400
				});
			}
		}
		// The account doesn't exists. Create it.
		else {
			bookshelf.transaction(function(t) {
				let newUser = new UserModel({
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email
				});
				let newAuth = null;
				newUser.save(null, {transacting: t})
				.then(function(user) {
					return AuthenticationModel.forge({
						type: 'local',
						identifier: req.body.email,
						password: req.body.password,
						userId: user.id
					})
					.save(null, {transacting: t})
					.then(function(newAuthModel) {
						newAuth = newAuthModel;
					});
				})
				.then(t.commit)
				.then(function() {
					// done(null, newAuth);
				})
				.catch(function(err) {
					t.rollback();
					// done(err);
				});
			});
		}
	});
});

router.post('/login', validateLocalCredentials, function(req, res, next) {

});

router.get('/finish', function(req, res, next) {

});

module.exports = router;
