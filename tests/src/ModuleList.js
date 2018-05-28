const path = require('path');

const { expect } = require('chai');

const ModuleList = require('../../src/ModuleList');

describe('ModuleList', function() {
  describe('constructor', function() {
    it('should work', function() {
      const ml = new ModuleList();
      expect(ml.modules).to.deep.equal([]);
      expect(ml.fallback).to.be.null;
    });
  });
  describe('add', function() {
    it('should add a module to the list', function() {
      const ml = new ModuleList();
      ml.add('core', path.join(__dirname, '../../src/core'), 'database');
      expect(ml.modules[0].path, 'path').to.equal('database');
      expect(ml.modules[0].group, 'group').to.equal('core');
      expect(ml.modules[0].contents, 'contents').to.be.a('function');
      expect(ml.modules[0].requires, 'requires').to.deep.equal(['config']);
      expect(ml.modules[0].resolved, 'resolved').to.be.false;
      expect(ml.modules[0].resolvedContents, 'resolvedContents').to.be.null;
    });
  });
  describe('find', function() {
    it('should find a module by its descriptor', function() {
      const ml = new ModuleList();
      ml.add('core', path.join(__dirname, '../../src/core'), 'database');
      ml.add('foo', path.join(__dirname, '../../src/core'), 'email');
      expect(ml.find('email')).to.be.undefined;
      expect(ml.find('foo/email')).to.be.ok;
    });
    it('should return undefined if nothing was found', function() {
      const ml1 = new ModuleList();
      ml1.add('core', path.join(__dirname, '../../src/core'), 'database');
      expect(ml1.find('asdf')).to.be.undefined;
    });
    it('should use the fallback list if necessary', function() {
      const ml1 = new ModuleList();
      const ml2 = new ModuleList(ml1);
      ml1.add('core', path.join(__dirname, '../../src/core'), 'database');
      expect(ml2.find('database').requires).to.deep.equal(['config'])
    });
  });
  describe('resolve', function() {
    it('should work if there are no modules', function() {
      const ml = new ModuleList();
      expect(() => ml.resolve()).not.to.throw();
    });
    it('should work if there are no dependencies', function() {
      const ml1 = new ModuleList();
      ml1.add('test', path.join(__dirname, '../fixtures/module-list'), 'foo');
      ml1.add('test', path.join(__dirname, '../fixtures/module-list'), 'bar');
      ml1.add('test', path.join(__dirname, '../fixtures/module-list'), 'baz/baz1');
      ml1.resolve();
      ml1.modules.forEach(m => expect(m.resolved).to.be.true);
    });
    it('should work if there are dependencies', function() {
      const ml1 = new ModuleList();
      ml1.add('test', path.join(__dirname, '../fixtures/module-list'), 'baz/baz1');
      ml1.add('test', path.join(__dirname, '../fixtures/module-list'), 'baz/baz2');
      ml1.resolve();
      ml1.modules.forEach(m => expect(m.resolved).to.be.true);
      expect(ml1.find('test/baz/baz2').resolvedContents()).to.equal('baz1 baz2');
    });
    it('should work if there is a fallback dependency', function() {
      const ml1 = new ModuleList();
      ml1.add('core', path.join(__dirname, '../fixtures/module-list'), 'fallback');
      const ml2 = new ModuleList(ml1);
      ml2.add('test', path.join(__dirname, '../fixtures/module-list'), 'baz/baz1');
      ml2.add('test', path.join(__dirname, '../fixtures/module-list'), 'baz/baz2');
      ml2.add('test', path.join(__dirname, '../fixtures/module-list'), 'requires-fallback');
      ml2.resolve();
      expect(ml2.find('test/requires-fallback').resolvedContents()).to.equal(
        'fallback requires-fallback'
      );
    });
    it('should throw an error if there are circular dependencies', function() {
      const ml1 = new ModuleList();
      ml1.add('test', path.join(__dirname, '../fixtures/module-list'), 'circular1');
      ml1.add('test', path.join(__dirname, '../fixtures/module-list'), 'circular2');
      expect(() => ml1.resolve()).to.throw(
        'The following modules could not resolve due to circular dependencies: test/circular1, ' +
        'test/circular2'
      );
    });
  });
  describe('buildAllDependencies', function() {
    it('should include fallbacks', function() {
      const ml1 = new ModuleList();
      ml1.add('core', path.join(__dirname, '../fixtures/module-list'), 'fallback');
      const ml2 = new ModuleList(ml1);
      ml2.add('test', path.join(__dirname, '../fixtures/module-list'), 'foo');
      ml2.add('test', path.join(__dirname, '../fixtures/module-list'), 'bar');
      ml2.add('test', path.join(__dirname, '../fixtures/module-list'), 'baz/baz1');
      ml2.resolve();
      const dependencies = ml2.buildAllDependencies();
      expect(dependencies.test.foo).to.be.a('function');
      expect(dependencies.test.bar).to.be.a('function');
      expect(dependencies.test.baz.baz1).to.be.a('function');
      expect(dependencies.fallback).to.be.a('function');
    });
    it('should not overwrite from fallbacks', function() {
      const ml1 = new ModuleList();
      ml1.add('test', path.join(__dirname, '../fixtures/module-list/baz'), 'foo');
      const ml2 = new ModuleList(ml1);
      ml2.add('test', path.join(__dirname, '../fixtures/module-list'), 'foo');
      ml2.add('test', path.join(__dirname, '../fixtures/module-list'), 'bar');
      ml2.add('test', path.join(__dirname, '../fixtures/module-list'), 'baz/baz1');
      ml2.resolve();
      const dependencies = ml2.buildAllDependencies();
      expect(dependencies.test.foo).to.be.a('function');
      expect(dependencies.test.bar).to.be.a('function');
      expect(dependencies.test.baz.baz1).to.be.a('function');
      expect(dependencies.test.foo()).to.equal('foo');
    });
  });
});
