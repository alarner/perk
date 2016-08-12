// Options for winston logger
// https://github.com/winstonjs/winston
module.exports = {
	level: 'info',
	transports: [
		new (require('winston').transports.Console)({
			handleExceptions: true,
			humanReadableUnhandledException: true,
			colorize: true,
			prettyPrint: true
		})
	],
	colors: {
		error: 'bgRed',
		warn: 'red',
		info: 'blue',
		verbose: 'purple',
		debug: 'yellow',
		silly: 'pink'
	}
};