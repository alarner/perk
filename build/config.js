/*eslint no-var: 0*/

// Connot run this script in strict mode because a dependency of config-template
// uses Octal literals, which are not allowed in strict mode.

var path = require('path');
var fs = require('fs');
var configTemplate = require('config-template');
var async = require('async');

const CONFIG_DIR = path.join(__dirname, '..', 'config');

module.exports = function(cb) {
	var templatePath = path.join(CONFIG_DIR, 'local.template.js');
	var valuePath = path.join(CONFIG_DIR, 'local.js');
	async.parallel({
		template: function(cb1) {
			fs.lstat(templatePath, function(err, stat) {
				if(err) {
					return cb1('Unable to load local config template: '+err.toString());
				}
				if(!stat.isFile()) {
					return cb1('config/local.template.js must be a file, not a directory.');
				}
				return cb1(null, require(templatePath));
			});
		},
		value: function(cb2) {
			fs.lstat(valuePath, function(err, stat) {
				if(err || !stat.isFile()) {
					return cb2(null, {});
				}
				return cb2(null, require(valuePath));
			});
		}
	}, function(err, results) {
		if(err) {
			return cb(err);
		}
		if(!results.value.session) {
			results.value.session = {};
		}
		if(!results.value.session.secret) {
			results.value.session.secret = Math.random().toString(36).slice(-16);
		}
		configTemplate(results.template, { appendExtraData: true, values: results.value })
		.then(function(config) {
			fs.writeFile(valuePath, 'module.exports = '+JSON.stringify(config, null, '\t')+';', function(err) {
				if(err) {
					cb('There was a problem saving the local.js config file: '+err.toString());
				}
				else {
					console.log(valuePath+' updated');
					cb();
				}
			});
		})
		.catch(function(err) {
			cb('Something went wrong while configuring the local.js file.');
		});
	});
};
