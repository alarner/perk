let chalk = require('chalk');
let path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const COLOR_MAP = {
	error: 'red',
	success: 'green'
};

function log(prefix, message, status) {
	prefix += ':';

	if(status && COLOR_MAP.hasOwnProperty(status)) {
		prefix = chalk[COLOR_MAP[status]](prefix);
	}
	console.log(`${prefix} ${message}`);
}

function error(prefix, message, file, line) {
	let e = chalk[COLOR_MAP.error];
	let notification = `${e(prefix)}: ${message}`;
	if(file && file.charAt(0) === '/') {
		file = file.substr(ROOT.length+1);
	}
	notification += `\nFile: ${file}\nLine: ${line}`;
	console.log(notification);
}

module.exports = {
	log,
	error
};