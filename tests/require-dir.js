const path = require('path');

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

const requireDir = require('../src/require-dir');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('require-dir', function() {
  it('should recursively load every javascript file', async function() {
    const result = await requireDir(path.join(__dirname, 'fixtures', 'test10'));
    expect(result['bar.js']).to.equal('bar');
    expect(result.controllers['auth.js']).to.be.ok;
  });
});
