const path = require('path');

const { expect } = require('chai');

const createDependencyResolver = require('../src/create-dependency-resolver');

describe('create-dependency-resolver', function() {
  it('should work if there are no dependencies', async function() {
    const dependencies = {
      foo() { return true },
      bar: {
        baz() { return false }
      }
    };
    const resolver = createDependencyResolver(dependencies);
    const unresolved = resolver();
    expect(unresolved).to.equal(0);
  });

  it('should work if there are dependencies', async function() {
    const foo = (dep) => () => dep.bar.baz();
    const baz = () => 'baz';
    foo.requires = ['bar/baz'];
    const dependencies = {
      'foo.js': foo,
      bar: {
        'baz.js': baz
      }
    };
    const resolver = createDependencyResolver(dependencies);
    const unresolved = resolver();
    expect(unresolved).to.equal(0);
    expect(dependencies.foo()).to.equal('baz');
  });

  it('should return a nonzero number if there are circular dependencies', async function() {
    const foo = (dep) => () => dep.bar.baz();
    foo.requires = ['bar/baz'];
    const baz = () => 'baz';
    baz.requires = ['foo'];
    const dependencies = {
      'foo.js': foo,
      bar: {
        'baz.js': baz
      }
    };
    const resolver = createDependencyResolver(dependencies);
    const unresolved = resolver();
    expect(unresolved).to.equal(2);
  });
});
