let express = require('express');
let router = express.Router();
let NotificationService = require('../lib/NotificationService')();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express / React Template' });
});

router.post('/test', function(req, res) {
	NotificationService
	.unsubscribe('email', 'anlarner@gmail.com', 'forgot-password/1')
	.then(() => {
		console.log('success');
	})
	.catch(err => {
		console.log('an error happened');
		console.log(err.toString());
		console.log(err.params());
	});
});

router.post('/subscribe', function(req, res) {
	NotificationService
	.addSubscriber('email', 'anlarner@gmail.com', 1, ['forgot-password/1'])
	.then(() => {
		console.log('addSubscriber success');
	})
	.catch(err => {
		console.log('an error happened');
		console.log(err.toString());
		console.log(err.params());
	});
});

module.exports = router;
