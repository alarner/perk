let express = require('express');
let router = express.Router();
let config = require('../lib/config');
let passport = require('passport');
let validator = require('validator');
let bcrypt = require('bcrypt');
let validateAuthType = require('../lib/middleware/validate-auth-type');
let validateAuthProfile = require('../lib/middleware/validate-auth-profile');
let validateLocalCredentials = require('../lib/middleware/validate-local-credentials');
let authenticator = require('../lib/auth/authenticator');
let AuthenticationModel = require('../models/Authentication');
let noDupe = require('../lib/auth/no-dupe');
let createUser = require('../lib/auth/create-user');
let createAuth = require('../lib/auth/create-auth');
let login = require('../lib/auth/login');
let Howhap = require('howhap');

router.use('/:type/login', validateAuthType, function(req, res, next) {
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
			successRedirect: config.auth[req.params.type].redirect || '/auth/finish',
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
	authenticator(req, req.session._auth_access_token, req.session._auth_profile, req.session._auth_type, function(err, authModel, userModel) {
		req.logIn(userModel, err => {
			if(err) {
				res.error.add('auth.UNKNOWN').send('/auth/login');
			}
			else {
				if(req.responseFormat() === 'html') {
					res.redirect(config.auth[authModel.get('type')].redirect || '/auth/finish');
				}
				else if(req.responseFormat() === 'json') {
					res.json(userModel.toJSON());
				}
			}
		});
	});

});

router.get('/register', function(req, res, next) {
	res.render('auth/register');
});

router.get('/login', function(req, res, next) {
	res.render('auth/login', { redirect: req.query.redirect || false });
});

router.use('/logout', function(req, res, next) {
	delete req.session.passport;
	if(req.responseFormat() === 'html') {
		res.redirect(req.query.redirect || '/');
	}
	else if(req.responseFormat() === 'json') {
		res.json({success: true});
	}
});

router.post('/register', validateLocalCredentials, function(req, res, next) {
	let userData = Object.assign({}, req.body);
	delete userData.password;

	bookshelf.transaction(function(t) {
		return noDupe(req.body.email, t)
		.then(createUser.bind(null, userData, t))
		.then(user => createAuth(user, req.body.password, t))
		.then(user => login(user, req.logIn.bind(req)))
		.then(t.commit)
		.catch(t.rollback);
	})
	.then(user => {
		if(req.responseFormat() === 'html') {
			res.redirect(config.auth.local.registerRedirect || '/auth/finish');
		}
		else if(req.responseFormat() === 'json') {
			res.json(user.toJSON());
		}
	})
	.catch(err => {
		if(err instanceof Howhap) {
			res.error.add(err.toJSON());
		}
		else {
			res.error.add('auth.UNKNOWN', {message: err.toString()});
		}
		res.error.send('/auth/register');
	});
});

router.post('/login', validateLocalCredentials, function(req, res, next) {
	let errorRedirect = '/auth/login';
	if(req.body.redirect) {
		errorRedirect += '?redirect='+encodeURIComponent(req.body.redirect);
	}
	AuthenticationModel.forge({
		type: 'local',
		identifier: req.body.email
	})
	.fetch({withRelated: ['user']})
	.then(function(auth) {
		if(!auth) {
			res.error.add('auth.UNKNOWN_USER', 'email').send(errorRedirect);
		}
		else {
			bcrypt.compare(req.body.password, auth.get('password'), function(err, result) {
				if(err) {
					res.error.add('auth.UNKNOWN').send(errorRedirect);
				}
				else if(!result) {
					res.error.add('auth.INVALID_PASSWORD', 'password').send(errorRedirect);
				}
				else {
					req.logIn(auth.related('user'), err => {
						if(err) {
							res.error.add('auth.UNKNOWN').send(errorRedirect);
						}
						else {
							if(req.responseFormat() === 'html') {
								res.redirect(
									req.body.redirect ||
									config.auth.local.loginRedirect ||
									'/dashboard'
								);
							}
							else if(req.responseFormat() === 'json') {
								res.json(auth.related('user').toJSON());
							}
						}
					});
				}
			});
		}
	});
});

router.get('/finish', function(req, res, next) {

});

module.exports = router;
