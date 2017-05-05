exports.up = function(knex, Promise) {
	return knex.schema.createTable('permissionGroups', function(t) {
		t.increments('id').unsigned().primary();
		t.dateTime('createdAt').notNull();
		t.dateTime('updatedAt').nullable();
		t.dateTime('deletedAt').nullable();

		t.string('name').notNull();
		t.integer('left').unsigned().notNull();
		t.integer('right').unsigned().notNull();
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('permissionGroups');
};
