const _ = require('lodash');
const metaPermissions = require('../lib/permissions');
const Group = bookshelf.model(
	'Group',
	{
		tableName: 'groups',
		hasTimestamps: ['createdAt', 'updatedAt', 'deletedAt'],
		permissions: function() {
			return Group.permissions(this.id);
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
		},
		permissions: function(id) {
			return Group.permissionHierarchy(id).then(Group.flattenHierarchy);
		},
		permissionHierarchy: function(id) {
			return knex.select(
				'parent.name',
				'parent.id',
				'parent.left',
				'permissions.descriptor',
				'permissions.value'
			).from('groups as node')
			.innerJoin('groups as parent', function() {
				this.on('node.left', '>=', 'parent.left')
				.andOn('node.left', '<=', 'parent.right');
			})
			.leftJoin('permissions', function() {
				this.on('permissions.groupId', 'parent.id');
			})
			.where('node.id', id)
			.whereNull('node.deletedAt')
			.whereNull('parent.deletedAt')
			.whereNull('permissions.deletedAt')
			.orderBy('parent.left')
			.then((permissions) => {
				const formattedPermissions = [];
				const groupedPermissions = _.groupBy(permissions, 'id');
				for(const groupId in groupedPermissions) {
					const keyed = {};
					const first = groupedPermissions[groupId][0];
					for(const permission of groupedPermissions[groupId]) {
						keyed[permission.descriptor] = permission.value;
					}
					formattedPermissions.push({
						id: first.id,
						name: first.name,
						permissions: metaPermissions.map((mp) => ({
							descriptor: mp.descriptor,
							value: (
								keyed.hasOwnProperty(mp.descriptor) ?
								Boolean(keyed[mp.descriptor]) :
								null
							)
						}))
					});
				}
				return formattedPermissions;
			});
		},
		flattenHierarchy: function(hierarchy) {
			const permissions = {};

			for(const permission of metaPermissions) {
				permissions[permission.descriptor] = {
					group: null,
					value: false
				};
			}

			for(const group of hierarchy) {
				for(const permission of group.permissions) {
					if(permission.value !== null) {
						permissions[permission.descriptor] = {
							group: {
								id: group.id,
								name: group.name
							},
							value: permission.value
						};
					}
				}
			}
			return permissions;
		}
	}
);

function addFirst(name, trx) {
	return trx('groups')
	.count('id as num')
	.then((rows) => rows[0].num)
	.then((count) => {
		if(count) {
			return Promise.reject(
				'You may not add a new group without a parent if there are already existing '+
				'permission groups.'
			);
		}
		return Group.forge().save(
			{ name, left: 1, right: 2 },
			{ transacting: trx }
		);
	});
}

function addSubsequent(name, parentId, trx) {
	// Get the left and right attributes of the parent
	return trx
	.select('left', 'right')
	.from('groups')
	.where('id', parentId)
	.whereNull('deletedAt')
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
		trx('groups')
		.where('left', '>', left)
		.where('right', '<', right)
		.whereNull('deletedAt')
		.count('id as num')
		.then((rows) => ({ count: rows[0].num, left, right }))
	))
	// Update the necessary existing records
	.then(({count, left, right}) => {
		const comparison = count ? right - 1 : left;
		return Promise.all([
			trx('groups')
			.where('right', '>', comparison)
			.whereNull('deletedAt')
			.increment('right', 2),
			trx('groups')
			.where('left', '>', comparison)
			.whereNull('deletedAt')
			.increment('left', 2)
		])
		.then(() => Promise.resolve(comparison));
	})
	// Insert the new record
	.then((comparison) => (
		Group.forge().save(
			{ name, left: comparison + 1, right: comparison + 2 },
			{ transacting: trx }
		)
	));
}

module.exports = Group;
