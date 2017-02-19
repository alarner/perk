let redishost = process.env.REDIS_HOST || '127.0.0.1';
let client = require('redis').createClient({host: redishost});
module.exports = function(res) {
	let cookie = res.headers['set-cookie'][0].split(';')[0];
	cookie = decodeURIComponent(cookie).split(':').pop().split('.').shift();
	return new Promise((resolve, reject) => {
		client.get(`sess:${cookie}`, (err, val) => {
			if(err) {
				return reject(err);
			}
			resolve(JSON.parse(val));
		});
	});
};
