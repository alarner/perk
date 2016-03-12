let express = require('express');
let router = express.Router();

let config = require('../lib/config');
let pjson = require('../package.json');
// let NotificationService = require('../lib/notification')([
// 	{
// 		pattern: 'forgot-password/:id',
// 		handler: 'forgot-password'
// 	}
// ], path.join(config.rootPath, 'views', 'notifications'));

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Express / React Template',
		env: config.env,
		version: pjson.version
	});
});

router.get('/dashboard', loggedIn, function(req, res, next) {
	res.render('dashboard', {
		title: 'User Dashboard',
		env: config.env,
		version: pjson.version
	});
});

module.exports = router;
