const path = require('path');

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

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
        await expect(user.addCredential('foo'), 'invalid type').to.be.rejectedWith(
          'Invalid credential type "foo".'
        );
        await expect(user.addCredential('local'), 'missing identifier').to.be.rejectedWith(
          'User.prototype.addCredential requires an identifier.'
        );
        await expect(user.addCredential('local', 'test@test.com'), 'missing secret').to.be.rejectedWith(
          'User.prototype.addCredential requires a secret.'
        );
      });
      it('should add the credential', async function() {
        const user = await this.models.User.create({ email: 'test@test.com' });
        const credential = await user.addCredential('local', 'test@test.com', 'this is a password');
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
            'local',
            'test@test.com',
            'this is a password',
            { foo: 'bar' },
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
  });
  describe('static methods', function() {
    describe('register', function() {
      it('should throw the appropriate validation errors', async function() {
        await expect(this.models.User.register(), 'missing email').to.be.rejectedWith(
          'User is missing an email.'
        );
        await expect(this.models.User.register('kajsdhf'), 'invalid email').to.be.rejectedWith(
          'Invalid email address supplied.'
        );
        await expect(
          this.models.User.register('test@test.com'),
          'invalid email'
        ).to.be.rejectedWith('User is missing a password.');
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
  });
});
