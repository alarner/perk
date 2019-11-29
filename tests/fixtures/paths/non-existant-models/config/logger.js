const winston = require('winston');
module.exports = {
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
      silent: true,
    })
  ]
};
