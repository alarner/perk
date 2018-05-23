const path = require('path');

const fs = require('fs-extra');

module.exports = async (name, rootDir, override, fallback) => {
  const p = override || fallback;
  const absolute = path.isAbsolute(p) ? p : path.join(rootDir, p);
  try {
    await fs.access(absolute);
  }
  catch(error) {
    if(!override) {
      throw new Error(
        `${name} is required. ` +
        `We tried the default value "${fallback}" but it doesn't exist.`
      );
    }
    console.log(error);
    throw new Error(`${name} value "${absolute}" does not exist.`);
  }
  return absolute;
};
