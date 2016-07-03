let request = require('supertest');
let expect = require('chai').expect;
let config = require('../../lib/config');
let _ = require('lodash');
let getSession = require('../helpers/get-session');
let HowhapList = require('howhap-list');

describe('POST /auth/login', function() {

	describe('responseFormat json', function() {

		it('should throw an error if no email is supplied', function(done) {
			request(app)
			.post('/auth/login')
			.send('password=password')
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(
					res.body,
					'MISSING_EMAIL error should be returned'
				).to.deep.equal({
					email: _.assign({params:{}}, config.errors.auth.MISSING_EMAIL)
				});
			})
			.expect(400, done);
		});

		it('should throw an error if no password is supplied', function(done) {
			request(app)
			.post('/auth/login')
			.send('email=foo@test.com')
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(
					res.body,
					'MISSING_PASSWORD error should be returned'
				).to.deep.equal({
					password: _.assign({params:{}}, config.errors.auth.MISSING_PASSWORD)
				});
			})
			.expect(400, done);
		});

		it('should throw an error if no email and no password are supplied', function(done) {
			request(app)
			.post('/auth/login')
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(
					res.body,
					'MISSING_EMAIL and MISSING_PASSWORD error should be returned'
				).to.deep.equal({
					email: _.assign({params:{}}, config.errors.auth.MISSING_EMAIL),
					password: _.assign({params:{}}, config.errors.auth.MISSING_PASSWORD)
				});
			})
			.expect(400, done);
		});

		it('should not log the user in if the email doesn\'t exist', function(done) {
			let cookie = null;

			request(app)
			.post('/auth/login')
			.expect('Content-Type', /json/)
			.send('email=foo@test.com')
			.send('password=password')
			.expect(404)
			.end(function (err, res) {
				expect(
					res.body
				).to.deep.equal({
					email: _.assign({params:{}}, config.errors.auth.UNKNOWN_USER)
				});

				cookie = res.headers['set-cookie'].pop().split(';')[0];
				let req = request(app).get('/dashboard?responseFormat=json');
				req.cookies = cookie;
				req.expect('Content-Type', /json/)
				.expect(function(res) {
					expect(res.body).to.deep.equal({
						default: {
							message: 'You must be logged in to perform that action.',
							params: {},
							status: 403
						}
					});
				})
				.expect(403, done);
			});
		});

		it('should not log the user in if the password is incorrect', function(done) {
			request(app)
			.post('/auth/login')
			.expect(404)
			.send('email=test@test.com')
			.send('password=password1')
			.end(function(err, res) {
				expect(
					res.body
				).to.deep.equal({
					password: _.assign({params:{}}, config.errors.auth.INVALID_PASSWORD)
				});
				done();
			});
		});

		it('should log the user in if all necessary information is provided', function(done) {
			request(app)
			.post('/auth/login')
			.send('email=test@test.com')
			.send('password=password')
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				expect(res.body.email).to.equal('test@test.com');
				getSession(res).then(session => {
					expect(session.passport).to.be.ok;
					expect(session.passport.user).to.be.ok;
					let cookie = res.headers['set-cookie'].pop().split(';')[0];
					let req = request(app).get('/dashboard');
					req.cookies = cookie;
					req.expect(200, done);
				})
				.catch(err => console.log(err));
			});
		});
	});
	
	describe('responseFormat html', function() {
		it('should throw an error if no email is supplied', function(done) {
			request(app)
			.post('/auth/login?responseFormat=html')
			.send('password=password')
			.expect(302)
			.end(function(err, res) {
				getSession(res).then(session => {
					let list = new HowhapList(session._howhap.errors);
					expect(list.toObject()).to.deep.equal({
						email: _.assign({params:{}}, config.errors.auth.MISSING_EMAIL)
					});
					done();
				})
				.catch(err => console.log(err));
			});
		});

		it('should throw an error if no password is supplied', function(done) {
			request(app)
			.post('/auth/login?responseFormat=html')
			.send('email=foo@test.com')
			.expect(302)
			.end(function(err, res) {
				getSession(res).then(session => {
					let list = new HowhapList(session._howhap.errors);
					expect(list.toObject()).to.deep.equal({
						password: _.assign({params:{}}, config.errors.auth.MISSING_PASSWORD)
					});
					done();
				})
				.catch(err => console.log(err));
			});
		});

		it('should throw an error if no email and no password are supplied', function(done) {
			request(app)
			.post('/auth/login?responseFormat=html')
			.expect(302)
			.end(function(err, res) {
				getSession(res).then(session => {
					let list = new HowhapList(session._howhap.errors);
					expect(list.toObject()).to.deep.equal({
						email: _.assign({params:{}}, config.errors.auth.MISSING_EMAIL),
						password: _.assign({params:{}}, config.errors.auth.MISSING_PASSWORD)
					});
					done();
				})
				.catch(err => console.log(err));
			});
		});

		it('should not log the user in if the email doesn\'t exist', function(done) {
			request(app)
			.post('/auth/login?responseFormat=html')
			.expect(302)
			.send('email=foo@test.com')
			.send('password=password')
			.end(function(err, res) {
				getSession(res).then(session => {
					let list = new HowhapList(session._howhap.errors);
					expect(list.toObject()).to.deep.equal({
						email: _.assign({params:{}}, config.errors.auth.UNKNOWN_USER)
					});
					done();
				})
				.catch(err => console.log(err));
			});
		});

		it('should not log the user in if the password is incorrect', function(done) {
			request(app)
			.post('/auth/login?responseFormat=html')
			.expect(302)
			.send('email=test@test.com')
			.send('password=password1')
			.end(function(err, res) {
				getSession(res).then(session => {
					let list = new HowhapList(session._howhap.errors);
					expect(list.toObject()).to.deep.equal({
						password: _.assign({params:{}}, config.errors.auth.INVALID_PASSWORD)
					});
					done();
				})
				.catch(err => console.log(err));
			});
		});

		it('should log the user in if all necessary information is provided', function(done) {
			request(app)
			.post('/auth/login?responseFormat=html')
			.send('email=test@test.com')
			.send('password=password')
			.expect(302)
			.expect('Location', '/dashboard')
			.end(function(err, res) {
				getSession(res).then(session => {
					expect(session.passport).to.be.ok;
					expect(session.passport.user).to.be.ok;
					let cookie = res.headers['set-cookie'].pop().split(';')[0];
					let req = request(app).get('/dashboard');
					req.cookies = cookie;
					req.expect(200, done);
				})
				.catch(err => console.log(err));
			});
		});
	});

});