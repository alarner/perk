const path = require('path');

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

const index = require('../../src/index');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('index', function() {
  describe('path validation', function() {
    it('should throw an error if the config directory doesn\'t exist', function() {
      return expect(index()).to.be.rejectedWith(
        `The supplied configuration path "${path.join(__dirname, 'config')}" doesn\'t exist.`
      );
    });
    it('should throw an error if the controllers directory doesn\'t exist', function() {
      const d = path.join(__dirname, 'controllers');
      return expect(index('../fixtures/paths/non-existant-controllers/config')).to.be.rejectedWith(
        `perk.paths.controllers is required. We tried the default value "${d}" but it doesn\'t exist.`
      );
    });
    it('should throw an error if the libraries directory doesn\'t exist', function() {
      const d = path.join(__dirname, 'libraries');
      return expect(index('../fixtures/paths/non-existant-libraries/config')).to.be.rejectedWith(
        `perk.paths.libraries is required. We tried the default value "${d}" but it doesn\'t exist.`
      );
    });
    it('should throw an error if the models directory doesn\'t exist', function() {
      const d = path.join(__dirname, 'models');
      return expect(index('../fixtures/paths/non-existant-models/config')).to.be.rejectedWith(
        `perk.paths.models is required. We tried the default value "${d}" but it doesn\'t exist.`
      );
    });
    it('should throw an error if the migrations directory doesn\'t exist', function() {
      const d = path.join(__dirname, 'migrations');
      return expect(index('../fixtures/paths/non-existant-migrations/config')).to.be.rejectedWith(
        `perk.paths.migrations is required. We tried the default value "${d}" but it doesn\'t exist.`
      );
    });
    it('should throw an error if the emails directory doesn\'t exist', function() {
      const d = path.join(__dirname, 'emails');
      return expect(index('../fixtures/paths/non-existant-emails/config')).to.be.rejectedWith(
        `perk.paths.emails is required. We tried the default value "${d}" but it doesn\'t exist.`
      );
    });
    it('should throw an error if the database configuration is missing a dialect', function() {
      return expect(index('../fixtures/paths/database-without-dialect/config')).to.be.rejectedWith(
        'Error while loading module "database": Dialect needs to be explicitly supplied as of v4.0.0'
      );
    });
    it('should work if the database and emails features are disabled', async function() {
      const server = await index('../fixtures/paths/valid-no-database-no-emails/config');
      expect(server).to.be.ok;
      await server.close();
    });
    it('should work if database feature is disabled', async function() {
      const server = await index('../fixtures/paths/valid-no-database/config');
      expect(server).to.be.ok;
      await server.close();
    });
    it('should work if emails feature is disabled', async function() {
      const server = await index('../fixtures/paths/valid-no-emails/config');
      expect(server).to.be.ok;
      await server.close();
    });
    it('should work if the database and emails features are enabled', async function() {
      const server = await index('../fixtures/paths/valid-database-and-emails/config');
      expect(server).to.be.ok;
      await server.close();
    });
  });
});
