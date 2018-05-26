const Module = require('./Module');
module.exports = function buildModuleList(basePath, paths) {
  return paths.map(p => new Module(basePath, p));
}
