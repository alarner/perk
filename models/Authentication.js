require('./User');
module.exports = bookshelf.model('Authentication', {
	tableName: 'authentication',
	hasTimestamps: ['createdAt', 'updatedAt'],
	user: function() {
		return this.belongsTo('User', 'userId');
	}
});