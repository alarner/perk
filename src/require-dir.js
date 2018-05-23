const path = require('path');

const fs = require('fs-extra');

module.exports = async function requireDir(dirPath) {
  const requires = {};
  const files = await fs.readdir(dirPath);
  const stats = await Promise.all(
    files.map(f => fs.lstat(path.join(dirPath, f)))
  );
  for(let i = 0; i < files.length; i++) {
    const f = files[i];
    if(stats[i].isDirectory()) {
      if(f.endsWith('.js')) {
        throw new Error(`Directories in ${dirPath} cannot end with ".js"`);
      }
      requires[f] = await requireDir(path.join(dirPath, f));
    }
    else if(f.endsWith('.js')) {
      requires[f] = require(path.join(dirPath, f));
    }
  }
  return requires;
};
