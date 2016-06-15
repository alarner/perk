let express = require('express');
let loggedIn = require('../lib/middleware/logged-in');
let router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', {
    title: "Perk Framework"
  });
});

router.get('/dashboard', loggedIn, function(req, res, next) {
	res.render('dashboard', {
		title: 'User Dashboard'
	});
});

module.exports = router;
