require('./Subscription');
module.exports = bookshelf.model('Notification', {
	tableName: 'notifications',
	hasTimestamps: ['createdAt', 'updatedAt'],
	subscription: function() {
		this.belongsTo('Subscription', 'subscriptionId');
	}
});