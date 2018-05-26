module.exports = ({ libraries }) => {
  return function foo() {
    return libraries.baz.baz1();
  };
};

module.exports.requires = ['libraries/baz/baz1'];
