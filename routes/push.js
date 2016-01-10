let express = require('express');
let router = express.Router();
let gcm = require('node-gcm');

let apiKey = 'AIzaSyCDcql7wvPvELeurgeHElcOKoPt-020Cww';

router.post('/subscribe', function(req, res, next) {
	console.log(req.body.subscriptionId);
	res.json({test: 'foo'});
	// res.render('index', { title: 'Express / React Template' });
});

router.get('/test', function(req, res) {
	let message = new gcm.Message();
	message.addData('key1', 'msg1');
	let sender = new gcm.Sender(apiKey, {resolveWithFullResponse: true});
	// Now the sender can be used to send messages
	sender.send(message, { registrationTokens: [req.query.token] }, function (err, response) {
		if(err) console.error(err);
		else    console.log(response);
		res.end();
	});
});

module.exports = router;
