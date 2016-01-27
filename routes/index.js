let express = require('express');
let router = express.Router();
let NotificationService = require('../lib/NotificationService')();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express / React Template' });
});

router.post('/test', function(req, res) {
	NotificationService
	.subscribe(1, '')
	.then(() => {
		console.log('success');
	})
	.catch(err => {
		console.log('an error happened');
		console.log(err.toString());
	});
});

module.exports = router;
