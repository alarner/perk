let path = require('path');
let email = require('./adapters/email');
let androidPush = require('./adapters/android-push');
let iosPush = require('./adapters/ios-push');
let text = require('./adapters/text');
let handlerConfig = {};

module.exports = function(viewPath, notificationConfig) {

	function loadConfig(handler, type) {
		if(!handlerConfig.hasOwnProperty(handler) || !handlerConfig[handler].hasOwnProperty(type)) {
			let newConfig = require(path.join(viewPath, handler, type, 'config'));
			if(newConfig) {
				handlerConfig[handler] = handlerConfig[handler] || {};
				handlerConfig[handler][type] = newConfig;
			}
		}
		return handlerConfig[handler][type];
	}

	return function(task) {
		switch(task.type.toLowerCase()) {
			case 'email':
				return email(
					task,
					loadConfig(task.handler, task.type),
					viewPath,
					notificationConfig,
					cb
				);
			break;
			case 'android-push':
				return androidPush(
					task,
					loadConfig(task.handler, task.type),
					viewPath,
					notificationConfig,
					cb
				);
			break;
			case 'ios-push':
				return iosPush(
					task,
					loadConfig(task.handler, task.type),
					viewPath,
					notificationConfig,
					cb
				);
			break;
			case 'text':
				return text(
					task,
					loadConfig(task.handler, task.type),
					viewPath,
					notificationConfig,
					cb
				);
			break;
		}
	};
};