const expect = require('chai').expect;
const PermissionGroup = require('../../models/PermissionGroup');

describe('PermissionGroup', function() {

	describe('add', function() {
		it('should successfully add the first group', function*() {
			const newGroup = yield PermissionGroup.add('foo');
			expect(newGroup.id, 'id').to.be.ok;
			expect(newGroup.get('left'), 'left').to.equal(1);
			expect(newGroup.get('right'), 'right').to.equal(2);
		});

		it('should not allow adding a group without a parent if there are already groups', function*() {
			yield PermissionGroup.add('foo1');

			let error;
			try {
				yield PermissionGroup.add('foo2');
			} catch (e) {
				error = e;
			}

			expect(error).to.equal('You may not add a new group without a parent if there are already existing permission groups.');
		});

		it('should add group to parent with no existing children', function*() {
			const rootGroup = yield PermissionGroup.add('root');
			const child = yield PermissionGroup.add('child', rootGroup.id);

			expect(child.id, 'id').to.be.ok;
			expect(child.get('left'), 'left').to.equal(2);
			expect(child.get('right'), 'right').to.equal(3);
		});

		it('should add group to that does have existing children', function*() {
			const rootGroup = yield PermissionGroup.add('root');
			const child1 = yield PermissionGroup.add('child1', rootGroup.id);

			expect(child1.id, 'id').to.be.ok;
			expect(child1.get('left'), 'left').to.equal(2);
			expect(child1.get('right'), 'right').to.equal(3);

			const child2 = yield PermissionGroup.add('child2', rootGroup.id);

			expect(child2.id, 'id').to.be.ok;
			expect(child2.get('left'), 'left').to.equal(4);
			expect(child2.get('right'), 'right').to.equal(5);
		});
	});

});
