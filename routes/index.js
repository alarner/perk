let express = require('express');
let router = express.Router();
let config = require('../lib/config');
let path = require('path');
let NotificationService = require('../lib/notification')([
	{
		pattern: 'forgot-password/:id',
		handler: 'forgot-password'
	}
], path.join(config.rootPath, 'views', 'notifications'));

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express / React Template' });
});

router.post('/unsubscribe', function(req, res) {
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

router.post('/send', function(req, res) {
	NotificationService
	.send('forgot-password/1', {foo: 'bar'}, true)
	.then((numSent) => {
		console.log('send success', numSent);
	})
	.catch(err => {
		console.log('send error happened');
		console.log(err.toString());
		console.log(err.params());
	});
});

module.exports = router;
