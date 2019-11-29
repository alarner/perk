module.exports = ({ fallback }) => () => `${fallback()} requires-fallback`;
module.exports.requires = ['fallback'];
