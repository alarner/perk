const path = require('path');

const _ = require('lodash');

module.exports = class Module {
  constructor(basePath, modulePath, group, contents = null) {
    this.path = _.trim(_.trim(modulePath, path.sep), '.js');
    this.group = group;
    this.contents = contents || require(path.join(basePath, this.path));
    this.requires = this.contents.requires;
    this.resolved = !this.requires || !this.requires.length;
    this.resolvedContents = null;
    if(this.resolved) {
      this.resolvedContents = this.contents;
    }
  }
  descriptor() {
    if(this.group === 'core') {
      return this.path;
    }
    return path.join(this.group, this.path);
  }
}
