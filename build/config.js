/*eslint no-var: 0*/

// Connot run this script in strict mode because a dependency of config-template
// uses Octal literals, which are not allowed in strict mode.

var path = require('path');
var fs = require('fs');
var configTemplate = require('config-template');

const CONFIG_DIR = path.join(__dirname, '..', 'config');

module.exports = function(cb) {
	var templatePath = path.join(CONFIG_DIR, 'local.template.js');
	fs.lstat(templatePath, function(err, stat) {
		if(err) {
			cb('Unable to load local config template: '+err.toString());
		}
		else if(!stat.isFile()) {
			cb('config/local.template.js must be a file, not a directory.');
		}
		else {
			var template = require(templatePath);
			configTemplate(template)
			.then(function(config) {
				var localPath = path.join(CONFIG_DIR, 'local.js');
				fs.writeFile(localPath, 'module.exports = '+JSON.stringify(config, null, '\t')+';', function(err) {
					if(err) {
						cb('There was a problem saving the local.js config file: '+err.toString());
					}
					else {
						cb();
					}
				});
			})
			.catch(function(err) {
				cb('Something went wrong while configuring the local.js file.');
			});
		}
	});
};