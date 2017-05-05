const expect = require('chai').expect;
const Permission = require('../../models/Permission');

describe('Permission', function() {

	describe('set', function() {
		it('should successfully set a user based permission to false', function*() {
			const newPermission = yield Permission.set('user', 1, 'CREATE_USERS', false);
			expect(newPermission.id, 'id').to.be.ok;
			expect(newPermission.get('deletedAt'), 'left').to.be.null;
			expect(newPermission.get('descriptor'), 'descriptor').to.equal('CREATE_USERS');
			expect(newPermission.get('value'), 'value').to.equal(false);
		});

		it('should successfully set a user based permission to true that was previously deleted', function*() {
			const newPermission = yield Permission.set('user', 1, 'CREATE_USERS', false);
			expect(newPermission.id, 'id').to.be.ok;
			expect(newPermission.get('deletedAt'), 'left').to.be.null;
			expect(newPermission.get('descriptor'), 'descriptor').to.equal('CREATE_USERS');
			expect(newPermission.get('value'), 'value').to.equal(false);

			yield Permission.unset('user', 1, 'CREATE_USERS');

			const updatedPermission = yield Permission.set('user', 1, 'CREATE_USERS', true);
			expect(updatedPermission.id, 'id').to.be.ok;
			expect(updatedPermission.get('deletedAt'), 'left').to.be.null;
			expect(updatedPermission.get('descriptor'), 'descriptor').to.equal('CREATE_USERS');
			expect(updatedPermission.get('value'), 'value').to.equal(true);
		});

		it('should not allow setting descriptors that do not exist', function*() {
			let error = null;
			try {
				yield Permission.set('user', 1, 'FOO', false);
			}
			catch(e) {
				error = e;
			}

			expect(error).to.equal('Unknown descriptor FOO');
		});

	});

	describe('unset', function() {
		it('should successfully set a user based permission', function*() {
			const newPermission = yield Permission.set('user', 1, 'CREATE_USERS', false);
			expect(newPermission.id, 'id').to.be.ok;
			expect(newPermission.get('deletedAt'), 'left').to.be.null;
			expect(newPermission.get('descriptor'), 'descriptor').to.equal('CREATE_USERS');
			expect(newPermission.get('value'), 'value').to.equal(false);

			yield Permission.unset('user', 1, 'CREATE_USERS');
			const updatedPermission = yield Permission.forge({ userId: 1, descriptor: 'CREATE_USERS' }).fetch();
			expect(updatedPermission.id, 'id').to.be.ok;
			expect(updatedPermission.get('deletedAt'), 'left').not.to.be.null;
		});

	});

});
