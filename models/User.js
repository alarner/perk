require('./Authentication');
module.exports = bookshelf.model('User', {
	tableName: 'users',
	hasTimestamps: ['createdAt', 'updatedAt', 'deletedAt'],
	authentications: function() {
		this.hasMany('Authentication', 'userId');
	},
	subscribers: function() {
		this.hasMany('Subscriber', 'userId');
	}
});