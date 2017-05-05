const expect = require('chai').expect;
const User = require('../../models/User');
const Group = require('../../models/Group');
const Permission = require('../../models/Permission');

describe('User', function() {

	describe('fetchPermissions', function() {

		it('should return the default permission object if the user has no specific permissions', function*() {
			const user = yield User.forge({ email: 'test@test.com' }).fetch();
			yield redis.del(`permissions/${user.id}`);
			const permissions = yield user.fetchPermissions();
			expect(permissions).to.deep.equal({
				CREATE_USERS: false,
				DELETE_USERS: false,
				EDIT_USERS: false
			});
		});

		it('should take into account group permissions if the user belongs to a group', function*() {
			const user = yield User.forge({ email: 'test@test.com' }).fetch();
			const rootGroup = yield Group.add('root');
			yield Group.add('foo', rootGroup.id);
			const barGroup = yield Group.add('bar', rootGroup.id);
			const bazGroup = yield Group.add('baz', barGroup.id);
			yield Permission.set('group', rootGroup.id, 'CREATE_USERS', true);
			yield Permission.set('group', rootGroup.id, 'EDIT_USERS', false);
			yield Permission.set('group', barGroup.id, 'EDIT_USERS', true);
			yield Permission.set('group', bazGroup.id, 'CREATE_USERS', true);

			yield user.save({ groupId: barGroup.id });

			const permissions = yield user.fetchPermissions();
			expect(permissions).to.deep.equal({
				CREATE_USERS: true,
				DELETE_USERS: false,
				EDIT_USERS: true
			});
		});

	});

	describe('setPermissions / hasPermissions', function() {

		it('should not have any permissions to begin with', function*() {
			const user = yield User.forge({ email: 'test@test.com' }).fetch();
			expect(user.hasPermission('CREATE_USERS')).to.equal(false);
			expect(user.hasPermission('DELETE_USERS')).to.equal(false);
			expect(user.hasPermission('EDIT_USERS')).to.equal(false);
		});

		it('should return true if permission is set to true', function*() {
			const user = yield User.forge({ email: 'test@test.com' }).fetch();
			user.setPermissions({ CREATE_USERS: true });
			expect(user.hasPermission('CREATE_USERS')).to.equal(true);
			expect(user.hasPermission('DELETE_USERS')).to.equal(false);
			expect(user.hasPermission('EDIT_USERS')).to.equal(false);
		});

		it('should throw an error if the descriptor doesn\'t exist', function*() {
			const user = yield User.forge({ email: 'test@test.com' }).fetch();
			expect(() => user.setPermissions({ FOO: true })).to.throw('Invalid descriptor');
			expect(() => user.hasPermission('foo')).to.throw('Invalid descriptor');
		});

	});

	describe('deserialize', function() {

		it('should look in the database if it doesn\'t find the user in redis', function*() {
			const user = yield User.forge({ email: 'test@test.com' }).fetch();
			yield redis.del(`user/${user.id}`);
			const deserializedUser = yield User.deserialize(user.id);
			expect(deserializedUser.id).to.equal(user.id);
		});

		it('should grab the user from redis if it can', function*() {
			const user = yield User.forge({ email: 'test@test.com' }).fetch();
			yield Permission.set('user', user.id, 'CREATE_USERS', true);
			yield redis.del(`user/${user.id}`);
			// First call puts user into redis
			yield User.deserialize(user.id);
			// Second call pulls user from redis
			const deserializedUser = yield User.deserialize(user.id);
			expect(deserializedUser.id).to.equal(user.id);
			expect(deserializedUser.hasPermission('CREATE_USERS')).to.equal(true);
		});

	});

});
