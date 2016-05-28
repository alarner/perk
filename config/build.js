module.exports = {
	scripts: {
		loader: 'browserify',
		files: [
			'public/scripts/main.js'
		]
	},
	styles: {
		directory: 'public/styles'
	},
	server: {
		files: [
			'views/**/*.html',
			'routes/**/*.js',
			'models/**/*.js',
			'lib/**/*.js',
			'config/**/*.js',
			'errors/**/*.js',
			'app.js'
		]
	},
	watching: {
		poll: false,
		interval: 100
	}
};
