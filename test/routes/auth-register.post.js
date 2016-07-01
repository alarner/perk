let request = require('supertest');
let expect = require('chai').expect;
let config = require('../../lib/config');
let _ = require('lodash');
let getSession = require('../helpers/get-session');
let HowhapList = require('howhap-list');

describe('POST /auth/register', function() {

	describe('responseFormat json', function() {
		it('should throw an error if the user is already registered', function(done) {
			request(app)
			.post('/auth/register')
			.send('firstName=Aaron')
			.send('lastName=Larner')
			.send('email=test@test.com')
			.send('password=password')
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(
					res.body,
					'EMAIL_EXISTS error should be returned'
				).to.deep.equal({
					default: _.assign({params:{}}, config.errors.auth.EMAIL_EXISTS)
				});
			})
			.expect(409, done);
		});

		it('should throw an error if no email is supplied', function(done) {
			request(app)
			.post('/auth/register')
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
			.post('/auth/register')
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
			.post('/auth/register')
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

		it('should throw an error if a bad field is supplied', function(done) {
			request(app)
			.post('/auth/register')
			.expect('Content-Type', /json/)
			.send('email=foo@test.com')
			.send('password=password')
			.send('username=bananas')
			.expect(function(res) {
				expect(res.body.default).not.to.be.undefined;
				expect(res.body.default.message).to.equal('An unknown error occurred: {{message}}');
			})
			.expect(500, done);
		});

		it('should not log the user in if registration fails', function(done) {
			let cookie = null;

			request(app)
			.post('/auth/register')
			.expect('Content-Type', /json/)
			.send('email=foo@test.com')
			.send('password=password')
			.send('username=bananas')
			.expect(function(res) {
				expect(res.body.default).not.to.be.undefined;
				expect(res.body.default.message).to.equal('An unknown error occurred: {{message}}');
			})
			.expect(500)
			.end(function (err, res) {
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

		

		it('should create a user if all necessary information is provided', function(done) {
			request(app)
			.post('/auth/register')
			.send('email=foo@test.com')
			.send('password=password')
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(res.body.email).to.equal('foo@test.com');
			})
			.expect(200, done);
		});

		it('should log the user in after registration', function(done) {
			let cookie = null;

			request(app)
			.post('/auth/register')
			.send('email=foo@test.com')
			.send('password=password')
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(res.body.email).to.equal('foo@test.com');
			})
			.expect(200)
			.end(function (err, res) {
				getSession(res).then(session => {
					expect(session.passport).to.be.ok;
					expect(session.passport.user).to.be.ok;
					cookie = res.headers['set-cookie'].pop().split(';')[0];
					let req = request(app).get('/dashboard');
					req.cookies = cookie;
					req.expect(200, done);
				})
				.catch(err => console.log(err));
			});
		});
	});
	
	describe('responseFormat html', function() {
		it('should throw an error if the user is already registered', function(done) {
			request(app)
			.post('/auth/register?responseFormat=html')
			.send('firstName=Aaron')
			.send('lastName=Larner')
			.send('email=test@test.com')
			.send('password=password')
			.expect(302)
			.end(function(err, res) {
				getSession(res).then(session => {
					let list = new HowhapList(session._howhap.errors);
					expect(list.toObject()).to.deep.equal({
						default: _.assign({params:{}}, config.errors.auth.EMAIL_EXISTS)
					});
					done();
				})
				.catch(err => console.log(err));
			});
		});

		it('should throw an error if no email is supplied', function(done) {
			request(app)
			.post('/auth/register?responseFormat=html')
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
			.post('/auth/register?responseFormat=html')
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
			.post('/auth/register?responseFormat=html')
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

		it('should throw an error if a bad field is supplied', function(done) {
			request(app)
			.post('/auth/register?responseFormat=html')
			.expect(302)
			.send('email=foo@test.com')
			.send('password=password')
			.send('username=bananas')
			.end(function(err, res) {
				getSession(res).then(session => {
					let list = new HowhapList(session._howhap.errors);
					let obj = list.toObject();
					expect(obj.default).not.to.be.undefined;
					expect(obj.default.message).to.equal('An unknown error occurred: {{message}}');
					done();
				})
				.catch(err => console.log(err));
			});
		});

		it('should not log the user in if registration fails', function(done) {
			let cookie = null;

			request(app)
			.post('/auth/register?responseFormat=html')
			.expect(302)
			.send('email=foo@test.com')
			.send('password=password')
			.send('username=bananas')
			.end(function(err, res) {
				getSession(res).then(session => {
					let list = new HowhapList(session._howhap.errors);
					let obj = list.toObject();
					expect(obj.default).not.to.be.undefined;
					expect(obj.default.message).to.equal('An unknown error occurred: {{message}}');
					
					cookie = res.headers['set-cookie'][0].split(';')[0];
					let req = request(app).get('/dashboard?responseFormat=html');
					req.cookies = cookie;
					req.expect(302)
					.end(function(err, r) {
						getSession(res).then(session => {
							let list = new HowhapList(session._howhap.errors);
							expect(list.toObject()).to.deep.equal({
								default: {
									message: 'You must be logged in to perform that action.',
									params: {},
									status: 403
								}
							});
							done();
						})
						.catch(err => console.log(err));
					});
				})
				.catch(err => console.log(err));
			});
		});

		it('should create a user if all necessary information is provided', function(done) {
			request(app)
			.post('/auth/register?responseFormat=html')
			.send('email=foo@test.com')
			.send('password=password')
			.expect('Location', '/dashboard')
			.expect(302, done);
		});

		it('should log the user in after registration', function(done) {
			let cookie = null;

			request(app)
			.post('/auth/register?responseFormat=html')
			.send('email=foo@test.com')
			.send('password=password')
			.expect(302)
			.end(function (err, res) {
				getSession(res).then(session => {
					expect(session.passport).to.be.ok;
					expect(session.passport.user).to.be.ok;
					cookie = res.headers['set-cookie'].pop().split(';')[0];
					let req = request(app).get('/dashboard');
					req.cookies = cookie;
					req.expect(200, done);
				})
				.catch(err => console.log(err));
			});
		});
	});

});