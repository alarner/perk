exports.up = function(knex, Promise) {
	return knex.schema.createTable('subscribers', function(t) {
		t.increments('id').unsigned().primary();
		t.enum('type', [
			'email',
			'text',
			'push-web',
			'push-android',
			'push-ios'
		]);
		t.string('key').notNull();
		t.integer('userId')
			.unsigned()
			.nullable()
			.references('id')
			.inTable('users')
			.onDelete('CASCADE');
		t.dateTime('createdAt').notNull();
		t.dateTime('updatedAt').nullable();
		t.unique(['type','key'], 'type_key');
	})
	.then(function() {
		return knex.schema.createTable('subscriptions', function(t) {
			t.increments('id').unsigned().primary();
			t.string('descriptor');
			t.integer('subscriberId')
				.unsigned()
				.nullable()
				.references('id')
				.inTable('subscribers')
				.onDelete('CASCADE');
			t.dateTime('createdAt').notNull();
			t.dateTime('updatedAt').nullable();
			t.unique(['descriptor','subscriberId'], 'descriptor_subscriberId');
		});
	})
	.then(function() {
		return knex.schema.createTable('unsubscriptions', function(t) {
			t.increments('id').unsigned().primary();
			t.integer('subscriptionId')
				.unsigned()
				.notNull()
				.references('id')
				.inTable('subscriptions')
				.onDelete('CASCADE');
			t.string('reason');
			t.dateTime('createdAt').notNull();
			t.dateTime('updatedAt').nullable();
			t.unique(['subscriptionId'], 'subscriptionId');
		});
	})
	.then(function() {
		return knex.schema.createTable('notifications', function(t) {
			t.increments('id').unsigned().primary();
			t.integer('subscriptionId')
				.unsigned()
				.notNull()
				.references('id')
				.inTable('subscriptions')
				.onDelete('CASCADE');
			t.dateTime('sendAt').notNull();
			t.dateTime('sentAt').nullable();
			t.string('error').nullable();
			t.dateTime('createdAt').notNull();
			t.dateTime('updatedAt').nullable();
		});
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('subscribers').then(function() {
		return knex.schema.dropTable('subscriptions');
	}).then(function() {
		return knex.schema.dropTable('unsubscriptions');
	}).then(function() {
		return knex.schema.dropTable('notification');
	});
};
