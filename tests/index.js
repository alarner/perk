const path = require('path');

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

const index = require('../src/index');

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
      return expect(index('./fixtures/test01/config')).to.be.rejectedWith(
        `perk.paths.controllers is required. We tried the default value "${d}" but it doesn\'t exist.`
      );
    });
    it('should throw an error if the libraries directory doesn\'t exist', function() {
      const d = path.join(__dirname, 'libraries');
      return expect(index('./fixtures/test02/config')).to.be.rejectedWith(
        `perk.paths.libraries is required. We tried the default value "${d}" but it doesn\'t exist.`
      );
    });
    it('should throw an error if the models directory doesn\'t exist', function() {
      const d = path.join(__dirname, 'models');
      return expect(index('./fixtures/test03/config')).to.be.rejectedWith(
        `perk.paths.models is required. We tried the default value "${d}" but it doesn\'t exist.`
      );
    });
    it('should work if all directories exist', async function() {
      const server = await index('./fixtures/test04/config');
      expect(server).to.be.ok;
      server.close();
    });
    it('should throw an error if the emails directory doesn\'t exist', function() {
      const d = path.join(__dirname, 'emails');
      return expect(index('./fixtures/test05/config')).to.be.rejectedWith(
        `perk.paths.emails is required. We tried the default value "${d}" but it doesn\'t exist.`
      );
    });
    it('should work if all directories exist with email', async function() {
      const server = await index('./fixtures/test06/config');
      expect(server).to.be.ok;
      server.close();
    });
  });
  describe('database validation', function() {
    it('should throw an error if the database configuration is missing a dialect', function() {
      return expect(index('./fixtures/test09/config')).to.be.rejectedWith(
        'Error while loading module "database": Dialect needs to be explicitly supplied as of v4.0.0'
      );
    });
    it('should work if the configuration is valid', async function() {
      const server = await index('./fixtures/test10/config');
      expect(server).to.be.ok;
      server.close();
    });
  });
});
