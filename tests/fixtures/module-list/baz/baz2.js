module.exports = ({ test }) => () => `${test.baz.baz1()} baz2`;
module.exports.requires = ['test/baz/baz1'];
