require('./Authentication');
const Promise = require('bluebird');
const Permission = require('./Permission');
const Group = require('./Group');
const metaPermissions = require('../lib/permissions');
const defaultPermissions = {};
for(const permission of metaPermissions) {
	defaultPermissions[permission.descriptor] = false;
}


const User = bookshelf.model(
	'User', (() => {
		let permissions = Object.assign({}, defaultPermissions);

		return {
			tableName: 'users',
			hasTimestamps: ['createdAt', 'updatedAt', 'deletedAt'],
			authentication: function() {
				return this.hasMany('Authentication', 'userId');
			},
			setPermissions: function(newPermissions) {
				for(const descriptor in newPermissions) {
					if(!permissions.hasOwnProperty(descriptor)) {
						throw new Error(`Invalid descriptor "${descriptor}"`);
					}
				}
				permissions = Object.assign({}, defaultPermissions, newPermissions);
			},
			hasPermission: function(descriptor) {
				if(!permissions.hasOwnProperty(descriptor)) {
					throw new Error(`Invalid descriptor "${descriptor}"`);
				}
				return permissions[descriptor];
			},
			fetchPermissions: function() {
				const permissionsKey = `permissions/${this.id}`;
				// If permissions are already in redis, return those
				return redis.get(permissionsKey)
				.then((permissions) => {
					if(permissions) {
						return JSON.parse(permissions);
					}

					// If they are not in redis, fetch them from the database
					const props = {
						user: Permission.forge({ userId: this.id, deletedAt: null }).fetchAll()
					};
					if(this.get('groupId')) {
						props.group = Group.permissions(this.get('groupId'));
					}
					return Promise.props(props)
					.then((results) => {
						const fetchedPermissions = Object.assign({}, defaultPermissions);
						// First load group permissions if there are any
						if(results.group) {
							for(const descriptor in results.group) {
								fetchedPermissions[descriptor] = results.group[descriptor].value;
							}
						}
						// Then override with user specific permissions
						results.user = results.user;
						for(const permission of results.user.models) {
							fetchedPermissions[permission.get('descriptor')] = Boolean(permission.get('value'));
						}

						// Finally save the permission in redis and return them
						return redis.set(
							permissionsKey,
							JSON.stringify(fetchedPermissions)
						).then(() => fetchedPermissions);
					});
				});
			},
			invalidateUser: function() {
				return redis.del(`user/${this.id}`);
			},
			invalidatePermissions: function() {
				return redis.del(`permissions/${this.id}`);
			}
		};

	})(),
	{
		deserialize: function(userId) {
			const userKey = `user/${userId}`;
			let user = null;
			// Try to get the user from redis before looking in the database
			return redis.get(userKey)
			.then((u) => {
				if(u) {
					return new User(JSON.parse(u));
				}
				else {
					// If the user is not already in redis, get it from the database and saveit in
					// redis
					return User
					.forge({ id: userId })
					.fetch()
					.then((u) => redis.set(userKey, JSON.stringify(u.toJSON())).then(() => u));
				}
			})
			// Try to get permissions from redis before looking in the database
			.then((u) => {
				user = u;
				return user.fetchPermissions();
			})
			.then((permissions) => {
				user.setPermissions(permissions);
				return user;
			});
		}
	}
);

module.exports = User;
