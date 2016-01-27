require('./User');
module.exports = bookshelf.model('Subscriber', {
	tableName: 'subscribers',
	hasTimestamps: ['createdAt', 'updatedAt'],
	user: function() {
		return this.belongsTo('User', 'userId');
	},
	subscriptions: function() {
		this.hasMany('Subscription', 'subscriberId');
	}
});