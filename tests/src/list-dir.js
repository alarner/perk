const path = require('path');

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

const listDir = require('../../src/list-dir');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('list-dir', function() {
  it('should recursively load every javascript file', async function() {
    const expectations = [
      '/tests/fixtures/list-dir/bar.js',
      '/tests/fixtures/list-dir/baz/baz1.js',
      '/tests/fixtures/list-dir/baz/baz2.js',
      '/tests/fixtures/list-dir/baz/foo.js',
      '/tests/fixtures/list-dir/circular1.js',
      '/tests/fixtures/list-dir/circular2.js',
      '/tests/fixtures/list-dir/fallback.js',
      '/tests/fixtures/list-dir/foo.js',
      '/tests/fixtures/list-dir/requires-fallback.js'
    ];
    const results = await listDir(path.join(__dirname, '../fixtures', 'list-dir'));
    expect(results.length).to.equal(9);
    results.forEach((result, i) => expect(result.endsWith(expectations[i]), result).to.be.true);
  });
});
