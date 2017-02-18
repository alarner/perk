module.exports = {
	secret: 'SECRET_GOES_HERE',
	resave: false,
	saveUninitialized: false,
	store: {
		host: "redis",
		port: 6379
	}
};
