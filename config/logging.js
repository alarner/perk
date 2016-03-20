// Options for bunyan logger
// https://github.com/trentm/node-bunyan
var PrettyStream = require('bunyan-prettystream');
var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);
module.exports = {
	name: 'a new perk app',
	stream: prettyStdOut,
    level: 'info'
};