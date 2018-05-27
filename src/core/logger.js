const winston = require('winston');

module.exports = ({ config }) => {
  return winston.createLogger(config.logger);
};
module.exports.requires = [ 'config' ];
