let request = require('supertest');
let expect = require('chai').expect;
let config = require('../../lib/config');
let _ = require('lodash');

describe('POST /auth/register -> JSON', function() {

	it('should throw an error if the user is already registered', function(done) {
		request(app)
		.post('/auth/register')
		.set('Accept', 'application/json')
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
		.set('Accept', 'application/json')
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
		.set('Accept', 'application/json')
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
		.set('Accept', 'application/json')
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
		.set('Accept', 'application/json')
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
		.set('Accept', 'application/json')
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
			let req = request(app).get('/dashboard').set('Accept', 'application/json');
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
		.set('Accept', 'application/json')
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
		.set('Accept', 'application/json')
		.send('email=foo@test.com')
		.send('password=password')
		.expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body.email).to.equal('foo@test.com');
		})
		.expect(200)
		.end(function (err, res) {
			cookie = res.headers['set-cookie'].pop().split(';')[0];
			let req = request(app).get('/dashboard');
			req.cookies = cookie;
			req.expect(200, done);
		});
	});
});