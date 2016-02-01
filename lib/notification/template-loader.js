let _ = require('lodash');
let fs = require('fs');
let templates = {};
module.exports = function(path, cb) {
	if(templates.hasOwnProperty(path)) {
		return cb(null, templates[path]);
	}
	fs.readFile(path, (err, data) => {
		if(err) {
			return cb(err);
		}
		templates[path] = _.template(data);
		return cb(null, templates[path]);
	});
};