module.exports = ({ libraries }) => {
  return function bar() {
    return libraries.foo();
  };
};
module.exports.requires = ['asdf/foo'];
