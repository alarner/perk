const Permission = bookshelf.model(
	'Permission',
	{
		tableName: 'permissions',
		hasTimestamps: ['createdAt', 'updatedAt', 'deletedAt']
	},
	{
		set: function(type, id, descriptor, value) {
			type = type.toLowerCase();
			if(!['user', 'group'].includes(type)) {
				return Promise.reject(`Unknown type ${type}`);
			}
			const forgeParams = { descriptor };
			forgeParams[`${type}Id`] = id;
			return knex.transaction((transacting) => (
				Permission
				.forge(forgeParams)
				.fetch({ transacting })
				.then((permission) => permission || new Permission(forgeParams))
				.then((permission) => permission.save({ value, deletedAt: null }, { transacting }))
			));
		},

		unset: function(type, id, descriptor) {
			const where = { descriptor };
			where[`${type}Id`] = id;
			return knex('permissions')
			.update({ deletedAt: new Date() })
			.where(where);
		}
	}
);

module.exports = Permission;
