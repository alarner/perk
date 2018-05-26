const path = require('path');

const Module = require('./Module');

module.exports = class ModuleList {
  constructor(fallback = null) {
    this.modules = [];
    this.fallback = fallback;
  }
  add(group, basePath, modulePath, contents = null) {
    this.modules.push(new Module(basePath, modulePath, group, contents));
  }
  resolve() {
    const unresolved = {
      previous: null,
      current: null
    };
    do {
      unresolved.previous = unresolved.current;
      unresolved.current = 0;
      for(const module of this.modules) {
        if(!module.resolved) {
          let resolved = true;
          for(const descriptor of module.requires) {
            const module = this.find(descriptor);
            if(!module) {
              throw new Error(
                `Bad require path "${req}" in ${module.path}. Required file not found.`
              );
            }
            if(!module.resolved) {
              resolved = false;
              break;
            }
          }
          module.resolved = resolved;
          if(module.resolved) {
            try {
              module.resolvedContents = module.contents(this.buildDependencies(module.requires));
            }
            catch(error) {
              throw new Error(
                `Error while loading module "${module.descriptor()}": ${error.message}`
              );
            }
          }
        }
        unresolved.current += module.resolved ? 0 : 1;
      }
    } while(unresolved.current !== 0 && unresolved.previous !== unresolved.current);
  }
  find(descriptor) {
    const module = this.modules.find(m => m.descriptor() === descriptor);
    if(!module && this.fallback) {
      return this.fallback.find(descriptor);
    }
    return module;
  }
  buildDependencies(requires) {
    const dependencies = {};
    for(const descriptor of requires) {
      const module = this.find(descriptor);
      if(module) {
        const pathPieces = module.path.split(path.sep);
        if(module.group !== 'core') {
          pathPieces.unshift(module.group);
        }
        let node = dependencies;
        for(let i = 0; i < pathPieces.length - 1; i++) {
          const piece = pathPieces[i];
          if(!node[piece]) {
            node[piece] = {};
          }
          node = node[piece];
        }
        node[pathPieces[pathPieces.length - 1]] = module.resolvedContents;
      }
    }
    return dependencies;
  }
}
