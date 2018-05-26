const create = ({ libraries }) => libraries.test();
module.exports = create;
module.exports.requires = [ 'libraries/test' ];
