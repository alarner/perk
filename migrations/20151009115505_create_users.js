exports.up = function(knex, Promise) {
	return knex.schema.createTable('users', function(t) {
		t.increments('id').unsigned().primary();
		t.dateTime('createdAt').notNull();
		t.dateTime('updatedAt').nullable();
		t.dateTime('deletedAt').nullable();

		t.string('firstName').nullable();
		t.string('lastName').nullable();
		t.string('email').notNullable();
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('users');
};
