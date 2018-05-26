const path = require('path');

const fs = require('fs-extra');

module.exports = async function listDir(dirPath) {
  let requires = [];
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
      requires = requires.concat(await listDir(path.join(dirPath, f)));
    }
    else if(f.endsWith('.js')) {
      requires.push(path.join(dirPath, f));
    }
  }
  return requires;
};
