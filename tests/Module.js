const path = require('path');

const { expect } = require('chai');

const Module = require('../src/Module');

describe('Module', function() {
  it('should throw an error if the module doesn\'t exist', function() {
    expect(() => new Module()).to.throw();
  });

  it('should set the correct properties', function() {
    const m = new Module(path.join(__dirname, '../src/core'), 'database', 'core');
    expect(m.path, 'path').to.equal('database');
    expect(m.group, 'group').to.equal('core');
    expect(m.contents, 'contents').to.be.a('function');
    expect(m.requires, 'requires').to.deep.equal(['config']);
    expect(m.resolved, 'resolved').to.be.false;
    expect(m.resolvedContents, 'resolvedContents').to.be.null;
  });

  it('should trim extraneous pieces from the path', function() {
    const m = new Module(path.join(__dirname, '../src/core'), '/database.js', 'core');
    expect(m.path, 'path').to.equal('database');
    expect(m.group, 'group').to.equal('core');
    expect(m.contents, 'contents').to.be.a('function');
    expect(m.requires, 'requires').to.deep.equal(['config']);
    expect(m.resolved, 'resolved').to.be.false;
    expect(m.resolvedContents, 'resolvedContents').to.be.null;
  });

  it('should return the correct descriptor for regular groups', function() {
    const m = new Module(path.join(__dirname, '../src/core'), '/database.js', 'foo');
    expect(m.descriptor()).to.equal('foo/database');
  });

  it('should return the correct descriptor for core groups', function() {
    const m = new Module(path.join(__dirname, '../src/core'), '/database.js', 'core');
    expect(m.descriptor()).to.equal('database');
  });

  it('should use custom contents if supplied', function() {
    const m = new Module(path.join(__dirname, '../src/core'), '/database.js', 'core', 'asdf');
    expect(m.contents).to.equal('asdf');
  });
});
