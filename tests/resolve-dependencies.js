const path = require('path');

const { expect } = require('chai');

const resolveDependencies = require('../src/resolve-dependencies');
const config = 'config test';

describe('resolve-dependencies', function() {
  it('should work if there are no dependencies', async function() {
    const resolved = await resolveDependencies({
      libraries: path.join(__dirname, 'fixtures/resolve-dependencies/test01/libraries'),
      models: path.join(__dirname, 'fixtures/resolve-dependencies/test01/models')
    }, config);
    expect(resolved.libraries.foo).to.be.a('function');
    expect(resolved.libraries.bar).to.be.a('function');
  });

  it('should work if there are dependencies', async function() {
    const resolved = await resolveDependencies({
      libraries: path.join(__dirname, 'fixtures/resolve-dependencies/test02/libraries'),
      models: path.join(__dirname, 'fixtures/resolve-dependencies/test02/models')
    }, config);
    expect(resolved.libraries.foo).to.be.a('function');
    expect(resolved.libraries.bar).to.be.a('function');
    expect(resolved.libraries.bar()).to.equal('foo');
  });

  it('should throw an error if a path doesn\'t exist', function() {
    const resolved = resolveDependencies({
      libraries: path.join(__dirname, 'fixtures/resolve-dependencies/asdf/libraries'),
      models: path.join(__dirname, 'fixtures/resolve-dependencies/asdf/models')
    }, config);
    return expect(resolved).to.be.rejected;
  });

  it('should throw an error if a dependency prefix is invalid', function() {
    const resolved = resolveDependencies({
      libraries: path.join(__dirname, 'fixtures/resolve-dependencies/test03/libraries'),
      models: path.join(__dirname, 'fixtures/resolve-dependencies/test03/models')
    }, config);
    return expect(resolved).to.be.rejectedWith(
      'Bad require path "asdf/foo"'
    );
  });

  it('should throw an error if a dependency prefix is invalid', function() {
    const resolved = resolveDependencies({
      libraries: path.join(__dirname, 'fixtures/resolve-dependencies/test04/libraries'),
      models: path.join(__dirname, 'fixtures/resolve-dependencies/test04/models')
    }, config);
    return expect(resolved).to.be.rejectedWith(
      'Bad require path "libraries/asdf"'
    );
  });

  it('should work with sub-directories', async function() {
    const resolved = await resolveDependencies({
      libraries: path.join(__dirname, 'fixtures/resolve-dependencies/test05/libraries'),
      models: path.join(__dirname, 'fixtures/resolve-dependencies/test05/models')
    }, config);
    expect(resolved.libraries.foo).to.be.a('function');
    expect(resolved.libraries.bar).to.be.a('function');
    expect(resolved.libraries.foo()).to.equal('baz1');
    expect(resolved.libraries.bar()).to.equal('baz1');
  });
});
