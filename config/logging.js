// Options for winston logger
// https://github.com/winstonjs/winston

let winston = require('winston');

module.exports = {
	level: 'info',
	transports: [
		new winston.transports.Console({
			handleExceptions: true,
			humanReadableUnhandledException: true,
			colorize: true,
			prettyPrint: true
		})
	],
	colors: {
		error: 'red',
		warn: 'orange',
		info: 'blue',
		verbose: 'purple',
		debug: 'yellow',
		silly: 'pink'
	}
};