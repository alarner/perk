const create = ({ test }) => 'foo';
module.exports = create;
module.exports.requires = { test: './test' };
