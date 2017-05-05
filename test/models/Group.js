const expect = require('chai').expect;
const Group = require('../../models/Group');
const Permission = require('../../models/Permission');

describe('Group', function() {

	describe('add', function() {
		it('should successfully add the first group', function*() {
			const newGroup = yield Group.add('foo');
			expect(newGroup.id, 'id').to.be.ok;
			expect(newGroup.get('left'), 'left').to.equal(1);
			expect(newGroup.get('right'), 'right').to.equal(2);
		});

		it('should not allow adding a group without a parent if there are already groups', function*() {
			yield Group.add('foo1');

			let error;
			try {
				yield Group.add('foo2');
			} catch (e) {
				error = e;
			}

			expect(error).to.equal('You may not add a new group without a parent if there are already existing permission groups.');
		});

		it('should add group to parent with no existing children', function*() {
			const rootGroup = yield Group.add('root');
			const child = yield Group.add('child', rootGroup.id);

			expect(child.id, 'id').to.be.ok;
			expect(child.get('left'), 'left').to.equal(2);
			expect(child.get('right'), 'right').to.equal(3);
		});

		it('should add group to that does have existing children', function*() {
			const rootGroup = yield Group.add('root');
			const child1 = yield Group.add('child1', rootGroup.id);

			expect(child1.id, 'id').to.be.ok;
			expect(child1.get('left'), 'left').to.equal(2);
			expect(child1.get('right'), 'right').to.equal(3);

			const child2 = yield Group.add('child2', rootGroup.id);

			expect(child2.id, 'id').to.be.ok;
			expect(child2.get('left'), 'left').to.equal(4);
			expect(child2.get('right'), 'right').to.equal(5);
		});

	});

	describe('permissionHierarchy', function() {
		it('should successfully retreive permission hierarchy for the specified group', function*() {
			const rootGroup = yield Group.add('root');
			yield Group.add('foo', rootGroup.id);
			const barGroup = yield Group.add('bar', rootGroup.id);
			const bazGroup = yield Group.add('baz', barGroup.id);
			yield Permission.set('group', rootGroup.id, 'CREATE_USERS', true);
			yield Permission.set('group', rootGroup.id, 'EDIT_USERS', false);
			yield Permission.set('group', barGroup.id, 'EDIT_USERS', true);
			yield Permission.set('group', bazGroup.id, 'CREATE_USERS', true);

			const permissions = yield Group.permissionHierarchy(bazGroup.id);
			expect(permissions.length, 'number of groups').to.equal(3);
			expect(permissions[0].name, 'first name').to.equal('root');
			expect(permissions[0].permissions.length).to.equal(3);
			expect(permissions[0].permissions[0].descriptor).to.equal('CREATE_USERS');
			expect(permissions[0].permissions[0].value).to.equal(true);
			expect(permissions[0].permissions[1].descriptor).to.equal('DELETE_USERS');
			expect(permissions[0].permissions[1].value).to.equal(null);
			expect(permissions[0].permissions[2].descriptor).to.equal('EDIT_USERS');
			expect(permissions[0].permissions[2].value).to.equal(false);
			expect(permissions[1].name, 'second name').to.equal('bar');
			expect(permissions[1].permissions.length).to.equal(3);
			expect(permissions[1].permissions[0].descriptor).to.equal('CREATE_USERS');
			expect(permissions[1].permissions[0].value).to.equal(null);
			expect(permissions[1].permissions[1].descriptor).to.equal('DELETE_USERS');
			expect(permissions[1].permissions[1].value).to.equal(null);
			expect(permissions[1].permissions[2].descriptor).to.equal('EDIT_USERS');
			expect(permissions[1].permissions[2].value).to.equal(true);
			expect(permissions[2].name, 'third name').to.equal('baz');
			expect(permissions[2].permissions.length).to.equal(3);
			expect(permissions[2].permissions[0].descriptor).to.equal('CREATE_USERS');
			expect(permissions[2].permissions[0].value).to.equal(true);
			expect(permissions[2].permissions[1].descriptor).to.equal('DELETE_USERS');
			expect(permissions[2].permissions[1].value).to.equal(null);
			expect(permissions[2].permissions[2].descriptor).to.equal('EDIT_USERS');
			expect(permissions[2].permissions[2].value).to.equal(null);
		});
	});

	describe('flattenHierarchy', function() {

		it('should convert all permission groups into one permissions object', function*() {
			const rootGroup = yield Group.add('root');
			yield Group.add('foo', rootGroup.id);
			const barGroup = yield Group.add('bar', rootGroup.id);
			const bazGroup = yield Group.add('baz', barGroup.id);
			yield Permission.set('group', rootGroup.id, 'CREATE_USERS', true);
			yield Permission.set('group', rootGroup.id, 'EDIT_USERS', false);
			yield Permission.set('group', barGroup.id, 'EDIT_USERS', true);
			yield Permission.set('group', bazGroup.id, 'CREATE_USERS', true);

			const hierarchy = yield Group.permissionHierarchy(bazGroup.id);
			const permissions = Group.flattenHierarchy(hierarchy);

			expect(permissions.CREATE_USERS).to.be.ok;
			expect(permissions.EDIT_USERS).to.be.ok;
			expect(permissions.DELETE_USERS).to.be.ok;
			expect(permissions.FOO).to.be.undefined;

			expect(permissions.CREATE_USERS.group).to.be.ok;
			expect(permissions.CREATE_USERS.group.name).to.equal('baz');
			expect(permissions.CREATE_USERS.value).to.equal(true);

			expect(permissions.DELETE_USERS.group).to.be.null;
			expect(permissions.DELETE_USERS.value).to.equal(false);

			expect(permissions.EDIT_USERS.group).to.be.ok;
			expect(permissions.EDIT_USERS.group.name).to.equal('bar');
			expect(permissions.EDIT_USERS.value).to.equal(true);
		});

	});

	describe('permissions', function() {

		it('should fetch permission hierarcy and flatten it', function*() {
			const rootGroup = yield Group.add('root');
			yield Group.add('foo', rootGroup.id);
			const barGroup = yield Group.add('bar', rootGroup.id);
			const bazGroup = yield Group.add('baz', barGroup.id);
			yield Permission.set('group', rootGroup.id, 'CREATE_USERS', true);
			yield Permission.set('group', rootGroup.id, 'EDIT_USERS', false);
			yield Permission.set('group', barGroup.id, 'EDIT_USERS', true);
			yield Permission.set('group', bazGroup.id, 'CREATE_USERS', true);

			const permissions = yield Group.permissions(bazGroup.id);

			expect(permissions.CREATE_USERS).to.be.ok;
			expect(permissions.EDIT_USERS).to.be.ok;
			expect(permissions.DELETE_USERS).to.be.ok;
			expect(permissions.FOO).to.be.undefined;

			expect(permissions.CREATE_USERS.group).to.be.ok;
			expect(permissions.CREATE_USERS.group.name).to.equal('baz');
			expect(permissions.CREATE_USERS.value).to.equal(true);

			expect(permissions.DELETE_USERS.group).to.be.null;
			expect(permissions.DELETE_USERS.value).to.equal(false);

			expect(permissions.EDIT_USERS.group).to.be.ok;
			expect(permissions.EDIT_USERS.group.name).to.equal('bar');
			expect(permissions.EDIT_USERS.value).to.equal(true);
		});

	});

});
