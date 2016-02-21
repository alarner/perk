let express = require('express');
let router = express.Router();

let config = require('../lib/config');
let path = require('path');
// let NotificationService = require('../lib/notification')([
// 	{
// 		pattern: 'forgot-password/:id',
// 		handler: 'forgot-password'
// 	}
// ], path.join(config.rootPath, 'views', 'notifications'));

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express / React Template' });
});

module.exports = router;
