exports.up = function(knex, Promise) {
	return knex.schema.createTable('permissions', function(t) {
		t.increments('id').unsigned().primary();
		t.dateTime('createdAt').notNull();
		t.dateTime('updatedAt').nullable();
		t.dateTime('deletedAt').nullable();

		t.string('descriptor').notNull();
		t.boolean('value').notNull().defaultTo(false);
		t.integer('userId')
			.unsigned()
			.nullable()
			.references('id')
			.inTable('users')
			.onDelete('CASCADE');
		t.integer('groupId')
			.unsigned()
			.nullable()
			.references('id')
			.inTable('groups')
			.onDelete('CASCADE');

		t.unique(['descriptor', 'userId', 'groupId']);

	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('permissions');
};
