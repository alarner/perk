require('./Subscriber');
require('./Unsubscription');
require('./Notification');
module.exports = bookshelf.model('Subscription', {
	tableName: 'subscriptions',
	hasTimestamps: ['createdAt', 'updatedAt'],
	subscriber: function() {
		this.belongsTo('Subscriber', 'subscriberId');
	},
	unsubscription: function() {
		this.hasOne('Unsubscription', 'subscriptionId');
	},
	notifications: function() {
		this.hasMany('Notification', 'subscriptionId');
	}
});