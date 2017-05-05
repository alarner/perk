const expect = require('chai').expect;
const Permission = require('../../models/Permission');

describe('Permission', function() {

	describe('set', function() {
		it('should successfully set a user based permission to false', function*() {
			const newPermission = yield Permission.set('user', 1, 'FOO', false);
			expect(newPermission.id, 'id').to.be.ok;
			expect(newPermission.get('deletedAt'), 'left').to.be.null;
			expect(newPermission.get('descriptor'), 'descriptor').to.equal('FOO');
			expect(newPermission.get('value'), 'value').to.equal(false);
		});

		it('should successfully set a user based permission to true that was previously deleted', function*() {
			const newPermission = yield Permission.set('user', 1, 'FOO', false);
			expect(newPermission.id, 'id').to.be.ok;
			expect(newPermission.get('deletedAt'), 'left').to.be.null;
			expect(newPermission.get('descriptor'), 'descriptor').to.equal('FOO');
			expect(newPermission.get('value'), 'value').to.equal(false);

			yield Permission.unset('user', 1, 'FOO');

			const updatedPermission = yield Permission.set('user', 1, 'FOO', true);
			expect(updatedPermission.id, 'id').to.be.ok;
			expect(updatedPermission.get('deletedAt'), 'left').to.be.null;
			expect(updatedPermission.get('descriptor'), 'descriptor').to.equal('FOO');
			expect(updatedPermission.get('value'), 'value').to.equal(true);
		});

	});

	describe('unset', function() {
		it('should successfully set a user based permission', function*() {
			const newPermission = yield Permission.set('user', 1, 'FOO', false);
			expect(newPermission.id, 'id').to.be.ok;
			expect(newPermission.get('deletedAt'), 'left').to.be.null;
			expect(newPermission.get('descriptor'), 'descriptor').to.equal('FOO');
			expect(newPermission.get('value'), 'value').to.equal(false);

			yield Permission.unset('user', 1, 'FOO');
			const updatedPermission = yield Permission.forge({ userId: 1, descriptor: 'FOO' }).fetch();
			expect(updatedPermission.id, 'id').to.be.ok;
			expect(updatedPermission.get('deletedAt'), 'left').not.to.be.null;
		});

	});

});
