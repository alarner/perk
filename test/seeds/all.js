exports.seed = function(knex, Promise) {
	return Promise.all([
		knex('users').del(),
		knex('authentication').del()
	]).then(() => {
		return knex('users').insert({
			firstName: 'Aaron',
			lastName: 'Larner',
			email: 'test@test.com',
			createdAt: new Date()
		})
		.returning('id')
		.then(ids => {
			return knex('authentication').insert({
				createdAt: new Date(),
				type: 'local',
				identifier: 'test@test.com',
				// password
				password: '$2a$10$WzXy2hWVLWJurIHAy7WKUuakOL1EeeFXAzdgfUq7/SCOqrhrembdO',
				userId: ids[0]
			});
		});
	});
};
