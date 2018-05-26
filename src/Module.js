const path = require('path');

const _ = require('lodash');

module.exports = class Module {
  constructor(basePath, modulePath, group, contents = null) {
    this.basePath = basePath;
    this.path = _.trim(_.trim(modulePath, path.sep), '.js');
    this.group = group;
    try {
      this.contents = contents || require(this.file());
    }
    catch(error) {
      throw new Error(
        `Error while requiring module "${this.descriptor()}": ${error.message}`
      );
    }
    this.requires = this.contents.requires;
    this.resolved = !this.requires || !this.requires.length;
    this.resolvedContents = null;
    if(this.resolved) {
      this.resolvedContents = this.contents;
    }
  }
  file() {
    return path.join(this.basePath, this.path);
  }
  descriptor() {
    if(this.group === 'core') {
      return this.path;
    }
    return path.join(this.group, this.path);
  }
}
