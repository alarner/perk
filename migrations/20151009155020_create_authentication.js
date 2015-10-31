exports.up = function(knex, Promise) {
	return knex.schema.createTable('authentication', function(t) {
		t.increments('id').unsigned().primary();
		t.dateTime('createdAt').notNull();
		t.dateTime('updatedAt').nullable();

		t.string('type').notNull();
		t.string('identifier').notNull();
		t.string('password').nullable();
		t.json('data').nullable();
		t.integer('userId')
			.unsigned()
			.notNull()
			.references('id')
			.inTable('users')
			.onDelete('CASCADE');
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('authentication');
};
