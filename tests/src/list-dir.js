const path = require('path');

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

const listDir = require('../../src/list-dir');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('list-dir', function() {
  it('should recursively load every javascript file', async function() {
    const expectations = [
      'tests/fixtures/test10/bar.js',
      'tests/fixtures/test10/config/database.js',
      'tests/fixtures/test10/config/logger.js',
      'tests/fixtures/test10/config/perk.js',
      'tests/fixtures/test10/controllers/auth.js',
      'tests/fixtures/test10/libraries/foo.js',
      'tests/fixtures/test10/libraries/test.js'
    ];
    const results = await listDir(path.join(__dirname, '../fixtures', 'test10'));
    expect(results.length).to.equal(7);
    results.forEach((result, i) => expect(result.endsWith(expectations[i]), result).to.be.true);
  });
});
