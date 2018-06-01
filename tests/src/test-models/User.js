const path = require('path');

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const { DateTime } = require('luxon');
const { Op } = require('sequelize');

const createUser = require('../../../src/models/User');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('models/User', function() {
  describe('instance methods', function() {
    describe('create', function() {
      it('should add a new user to the database', async function() {
        const user = await this.models.User.create({ email: 'test@test.com' });
        expect(user.email).to.equal('test@test.com');
      });
      it('should throw an error if there is no email', function() {
        return expect(this.models.User.create({})).to.be.rejected;
      });
    });
    describe('addCredential', function() {
      it('should throw the appropriate validation errors', async function() {
        const user = await this.models.User.create({ email: 'test@test.com' });
        await expect(user.addCredential(), 'missing type').to.be.rejectedWith(
          'User.prototype.addCredential requires a type.'
        );
        await expect(user.addCredential({ type: 'foo' }), 'invalid type').to.be.rejectedWith(
          'Invalid credential type "foo".'
        );
        await expect(user.addCredential({ type: 'local' }), 'missing identifier').to.be.rejectedWith(
          'User.prototype.addCredential requires an identifier.'
        );
        await expect(
          user.addCredential({ type: 'local', identifier: 'test@test.com' }),
          'missing secret'
        ).to.be.rejectedWith(
          'User.prototype.addCredential requires a secret.'
        );
      });
      it('should add the credential', async function() {
        const user = await this.models.User.create({ email: 'test@test.com' });
        const credential = await user.addCredential({
          type: 'local',
          identifier: 'test@test.com',
          secret: 'this is a password'
        });
        expect(credential.userId, 'userId').to.equal(user.id);
        expect(credential.identifier, 'identifier').to.equal('test@test.com');
        expect(credential.secret, 'secret').to.equal('this is a password');
        expect(credential.data, 'data').to.deep.equal({});
        expect(credential.type, 'type').to.equal('local');
      });
      it('should add the credential if there is a transaction supplied', async function() {
        await this.database.transaction(async (transaction) => {
          const user = await this.models.User.create({ email: 'test@test.com' }, { transaction });
          const credential = await user.addCredential(
            {
              type: 'local',
              identifier: 'test@test.com',
              secret: 'this is a password',
              data: { foo: 'bar' }
            },
            transaction
          );
          expect(credential.userId, 'userId').to.equal(user.id);
          expect(credential.identifier, 'identifier').to.equal('test@test.com');
          expect(credential.secret, 'secret').to.equal('this is a password');
          expect(credential.data, 'data').to.deep.equal({ foo: 'bar' });
          expect(credential.type, 'type').to.equal('local');
        });
      });
    });
    describe('storeToken', function() {
      it('should throw the appropriate validation errors', async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        await expect(user.storeToken('asdf'), 'invalid token type').to.be.rejectedWith(
          'Invalid token type "asdf".'
        );
        await expect(user.storeToken('foo_test'), 'invalid credential type').to.be.rejectedWith(
          'Invalid credential type "foo_test".'
        );
        await expect(user.storeToken('local'), 'length missing').to.be.rejectedWith(
          'Token type "local" missing length in authntication config.'
        );
      });
      it('should work', async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        const credential = await user.storeToken(this.models.Credential.types.RESET_PASSWORD);
        expect(credential.identifier.length).to.equal(15);
        const dbCred = await this.models.Credential.findOne({ where: { id: credential.id } });
        expect(dbCred).to.be.ok;
        expect(dbCred.identifier).to.equal(credential.identifier);
      });
    });
    describe('validateToken', function() {
      it(`should throw an error if the token doesn't exist`, async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        const result = user.validateToken(
          this.models.Credential.types.RESET_PASSWORD,
          'asdf',
          false
        );
        await expect(result).to.be.rejectedWith('Invalid token supplied.');
      });
      it(`should throw an error if the token is expired`, async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        const credential = await user.addCredential({
          type: this.models.Credential.types.RESET_PASSWORD,
          identifier: 'asdf',
          secret: 'asdf'
        });
        await credential.update({ expiresAt: DateTime.utc().minus({ minutes: 3 }).toISO() });
        const result = user.validateToken(
          this.models.Credential.types.RESET_PASSWORD,
          'asdf',
          false
        );
        await expect(result).to.be.rejectedWith('Token has expired.');
      });
      it(`should work if the token is valid`, async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        const credential = await user.addCredential({
          type: this.models.Credential.types.RESET_PASSWORD,
          identifier: 'asdf',
          secret: 'asdf'
        });
        const result = await user.validateToken(
          this.models.Credential.types.RESET_PASSWORD,
          'asdf',
          false
        );
        expect(result).to.be.true;
        const credential2 = await this.models.Credential.findOne({
          where: {
            type: this.models.Credential.types.RESET_PASSWORD,
            userId: user.id,
            identifier: 'asdf',
            secret: 'asdf'
          }
        });
        expect(credential2.deletedAt).to.be.null;
      });
      it(`should delete the token if instructed to`, async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        const credential = await user.addCredential({
          type: this.models.Credential.types.RESET_PASSWORD,
          identifier: 'asdf',
          secret: 'asdf'
        });
        const result = await user.validateToken(
          this.models.Credential.types.RESET_PASSWORD,
          'asdf',
          true
        );
        expect(result).to.be.true;
        const credential2 = await this.models.Credential.findOne({
          where: {
            type: this.models.Credential.types.RESET_PASSWORD,
            userId: user.id,
            identifier: 'asdf',
            secret: 'asdf'
          }
        });
        expect(credential2.deletedAt).not.to.be.null;
      });
      it(`should not be able to use a token twice`, async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        const credential = await user.addCredential({
          type: this.models.Credential.types.RESET_PASSWORD,
          identifier: 'asdf',
          secret: 'asdf'
        });
        const result = await user.validateToken(
          this.models.Credential.types.RESET_PASSWORD,
          'asdf',
          true
        );
        expect(result).to.be.true;
        const credential2 = await this.models.Credential.findOne({
          where: {
            type: this.models.Credential.types.RESET_PASSWORD,
            userId: user.id,
            identifier: 'asdf',
            secret: 'asdf'
          }
        });
        expect(credential2.deletedAt).not.to.be.null;
        const result2 = user.validateToken(
          this.models.Credential.types.RESET_PASSWORD,
          'asdf',
          true
        );
        await expect(result2).to.be.rejectedWith('Invalid token supplied.');
      });
    });
  });
  describe('static methods', function() {
    describe('register', function() {
      it('should throw the appropriate validation errors', async function() {
        await expect(this.models.User.register(), 'missing email').to.be.rejectedWith(
          'Action requires an email.'
        );
        await expect(this.models.User.register('kajsdhf'), 'invalid email').to.be.rejectedWith(
          'Invalid email address supplied.'
        );
        await expect(
          this.models.User.register('test@test.com'),
          'invalid email'
        ).to.be.rejectedWith('Action requires a password.');
      });
      it('should create the user', async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        expect(user.id).to.be.ok;
        expect(user.email).to.equal('test@test.com');
      });
      it('should throw an error if the user already has a password', async function() {
        await this.models.User.register('test@test.com', 'foo');
        await expect(
          this.models.User.register('test@test.com', 'newfoo'),
          'email exists'
        ).to.be.rejectedWith('A user with that email has already registered.');
        const users = await this.models.User.findAll({ where: { email: 'test@test.com' }});
        expect(users.length).to.equal(1);
      });
      it('should hash the password', async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        const credential = await this.models.Credential.findOne({ where: { userId: user.id }});
        expect(credential.secret).not.to.equal('foo');
      });
    });
    describe('hash', function() {
      it('should hash the input', async function() {
        const hash = await this.models.User.hash('asdf');
        expect(hash).to.be.ok;
      });
    });
    describe('generateToken', function() {
      it('should generate a random string', async function() {
        const random = await this.models.User.generateToken(10);
        expect(random.length).to.equal(10);
      });
    });
    describe('initiatePasswordRecovery', function() {
      it('should throw the appropriate validation errors', async function() {
        await expect(
          this.models.User.initiatePasswordRecovery(),
          'missing email'
        ).to.be.rejectedWith('Action requires an email.');
        await expect(
          this.models.User.initiatePasswordRecovery('foo'),
          'invalid email'
        ).to.be.rejectedWith('Invalid email address supplied.');
        await expect(
          this.models.User.initiatePasswordRecovery('t1@test.com'),
          'bad user'
        ).to.be.rejectedWith('No user with the supplied email address could be found.');
      });
      it('should work if the input is valid', async function() {
        await this.models.User.register('test@test.com', 'foo');
        const result = await this.models.User.initiatePasswordRecovery(
          'test@test.com',
          this.email,
          'reset-password'
        );
        expect(result).to.be.true;
      });
    });
    describe('changePassword', function() {
      it('should throw the appropriate validation errors', async function() {
        await this.models.User.register('test@test.com', 'foo');
        await expect(
          this.models.User.changePassword(),
          'missing email'
        ).to.be.rejectedWith('Action requires an email.');
        await expect(
          this.models.User.changePassword('foo'),
          'invalid email'
        ).to.be.rejectedWith('Invalid email address supplied.');
        await expect(
          this.models.User.changePassword('t1@test.com'),
          'missing token'
        ).to.be.rejectedWith('Action requires a token.');
        await expect(
          this.models.User.changePassword('t1@test.com', 'asdf'),
          'missing password'
        ).to.be.rejectedWith('Action requires a password.');
        await expect(
          this.models.User.changePassword('t1@test.com', 'asdf', 'foo'),
          'missing password'
        ).to.be.rejectedWith('No user with the supplied email address could be found.');
        await expect(
          this.models.User.changePassword('test@test.com', 'asdf', 'foo'),
          'invalid token'
        ).to.be.rejectedWith('Invalid token supplied.');
      });
      it('should work when the input is valid', async function() {
        const user = await this.models.User.register('test@test.com', 'foo');
        const credential = await user.storeToken(this.models.Credential.types.RESET_PASSWORD);
        const result = await this.models.User.changePassword(
          'test@test.com',
          credential.secret,
          'asddfsg',
          this.email,
          'reset-password-notification'
        );
        expect(result).to.be.ok;
        const credentials = await this.models.Credential.findAll({ where: {
          type: this.models.Credential.types.LOCAL,
          deletedAt: {
            [Op.eq]: null
          }
        }});
        expect(credentials.length).to.equal(1);
      });
    });
  });
});
