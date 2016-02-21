let config = require('./config');
let path = require('path');
// module.exports = require('nodeification')({
// 	routes: [
// 		{
// 			pattern: 'test',
// 			handler: 'test'
// 		}
// 	],
// 	knex: global.knex,
// 	viewPath: path.join(config.rootPath, 'views', 'notifications'),
// 	// errors: {...},
// 	// adapters: {
// 	// 	email: {...}	
// 	// },
// 	concurrency: 300,
// 	batchSize: 300,
// 	hasUsers: false
// });