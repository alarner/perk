const PermissionGroup = bookshelf.model(
	'PermissionGroup',
	{
		tableName: 'permissionGroups',
		hasTimestamps: ['createdAt', 'updatedAt', 'deletedAt'],
		authentication: function() {
			return this.hasMany('Authentication', 'userId');
		},
		numDescendants: function() {
			return knex('permissionGroups')
			.where('left', '>', this.get('left'))
			.where('right', '<', this.get('right'))
			.count('id');
		}
	},
	{
		add: function(name, parentId=null) {
			return knex.transaction((trx) => {
				if(parentId === null) {
					return addFirst(name, trx);
				}
				else {
					return addSubsequent(name, parentId, trx);
				}
			});
		}
	}
);

function addFirst(name, trx) {
	return trx('permissionGroups')
	.count('id as num')
	.then((rows) => rows[0].num)
	.then((count) => {
		if(count) {
			return Promise.reject(
				'You may not add a new group without a parent if there are already existing '+
				'permission groups.'
			);
		}
		return PermissionGroup.forge().save(
			{ name, left: 1, right: 2 },
			{ transacting: trx }
		);
	});
}

function addSubsequent(name, parentId, trx) {
	// Get the left and right attributes of the parent
	return trx
	.select('left', 'right')
	.from('permissionGroups')
	.where('id', parentId)
	.then((rows) => {
		if(!rows.length) {
			return Promise.reject(
				`Could not find permission group with id ${parentId}`
			);
		}
		return rows[0];
	})
	// Count the number of descendents that the parent has
	.then(({left, right}) => (
		trx('permissionGroups')
		.where('left', '>', left)
		.where('right', '<', right)
		.count('id as num')
		.then((rows) => ({ count: rows[0].num, left, right }))
	))
	// Update the necessary existing records
	.then(({count, left, right}) => {
		const comparison = count ? right - 1 : left;
		return Promise.all([
			trx('permissionGroups')
			.where('right', '>', comparison)
			.increment('right', 2),
			trx('permissionGroups')
			.where('left', '>', comparison)
			.increment('left', 2)
		])
		.then(() => Promise.resolve(comparison));
	})
	// Insert the new record
	.then((comparison) => (
		PermissionGroup.forge().save(
			{ name, left: comparison + 1, right: comparison + 2 },
			{ transacting: trx }
		)
	));
}

module.exports = PermissionGroup;
