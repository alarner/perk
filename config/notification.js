module.exports = {
	concurrency: 300,
	batchSize: 300,
	adapter: {
		email: {
			transport: {
				service: 'SendGrid',
				auth: {
					user: 'info@orionstudiomadison.com',
					pass: 'QPXu5aj6'
				}
			}
		}
	}
};