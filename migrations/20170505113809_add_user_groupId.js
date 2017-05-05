exports.up = function(knex, Promise) {
	return knex.schema.table('users', function(t) {
		t.integer('groupId')
			.unsigned()
			.nullable()
			.references('id')
			.inTable('groups')
			.onDelete('CASCADE');
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.table('users', function(t) {
		t.dropColumn('groupId');
	});
};
