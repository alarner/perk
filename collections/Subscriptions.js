let Subscription = require('../models/Subscription');
module.exports = bookshelf.Collection.extend({
	model: Subscription
});