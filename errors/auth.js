'use strict';
const authTypes = require('../config/auth');
let authTypePrompt = '';
let availTypes = [];
for (const type in authTypes) {
	if (authTypes[type].clientID && authTypes[type].clientID.indexOf('{{') === -1) {
		availTypes.push(type);
	}
	if (availTypes.length) {
		const loginLinks = availTypes.map(type => {
			return `<a href="/auth/${type}/login">${type}</a>`
		});
		authTypePrompt = `Perhaps you meant to login via ${loginLinks.join(', or ')}.`
	}
}

module.exports = {
	UNKNOWN: {
		message: 'An unknown error occurred.',
		status: 500
	},
	EMAIL_EXISTS: {
		message: `A user with that email has already registered. ${authTypePrompt} Would you like to <a href="/auth/reset-password">reset your password</a>?`,
		status: 409
	},
	INVALID_PASSWORD: {
		message: 'That password is not correct.',
		status: 401
	},
	INVALID_EMAIL: {
		message: 'It looks like that\'s not a valid email address.',
		status: 401
	},
	UNKNOWN_USER: {
		message: `A user with that email could not be found. ${authTypePrompt} Would you like to <a href="/auth/register">register</a>?`,
		status: 404
	},
	MISSING_EMAIL: {
		message: 'Please enter an email address.',
		status: 400
	},
	MISSING_PASSWORD: {
		message: 'Please enter a password.',
		status: 400
	},
	NOT_LOGGED_IN: {
		message: 'You must be logged in to perform that action.',
		status: 403
	}
};
