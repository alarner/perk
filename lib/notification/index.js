let Subscriber = require('../../models/Subscriber');
let Subscriptions = require('../../collections/Subscriptions');
let Subscription = require('../../models/Subscription');
let Unsubscription = require('../../models/Unsubscription');
let Howhap = require('howhap');
let errors = require('../../errors/notification');
let _ = require('lodash');
let Route = require('url-pattern');
let async = require('async');
let send = require('./send');
let logger = require('../logger');
let config = require('../config');
let path = require('path');

module.exports = function(routes) {

	let parsedRoutes = [];
	routes.forEach(route => {
		parsedRoutes.push({
			route: new Route(route.pattern),
			handler: route.handler
		});
	});

	function subscriberError(err) {
		if(err.code === '23505' && err.constraint === 'type_key') {
			let regex = /Key \(type, key\)=\((.+?), (.+?)\) already exists\./;
			let match = err.detail.match(regex);
			return Promise.reject(
				new Howhap(
					errors.DUPLICATE_SUBSCRIBER,
					{ type: match[1], key: match[2] }
				)
			);
		}
		return Promise.reject(
			new Howhap(
				errors.UNKNOWN,
				{ error: err }
			)
		);
	}

	function unsubscriptionError(err) {
		if(err.code === '23505' && err.constraint === 'subscriptionid') {
			let regex = /Key \("subscriptionId"\)=\((.+?)\) already exists\./;
			let match = err.detail.match(regex);
			return Promise.reject(
				new Howhap(
					errors.DUPLICATE_UNSUBSCRIPTION,
					{ subscriptionId: match[1] }
				)
			);
		}
		return Promise.reject(
			new Howhap(
				errors.UNKNOWN,
				{ error: err }
			)
		);
	}

	function subscriptionError(err) {
		if(err.code === '23505' && err.constraint === 'descriptor_subscriberid') {
			let regex = /Key \(descriptor, "subscriberId"\)=\((.+?), (.+?)\) already exists\./;
			let match = err.detail.match(regex);
			return Promise.reject(
				new Howhap(
					errors.DUPLICATE_SUBSCRIPTION,
					{ descriptor: match[1], subscriberId: match[2] }
				)
			);
		}
		else if(err.code === '23503' && err.constraint === 'subscriptions_subscriberid_foreign') {
			let regex = /Key \(subscriberId\)=\((.+?)\) is not present in table "subscribers"\./;
			let match = err.detail.match(regex);
			return Promise.reject(
				new Howhap(
					errors.UNKNOWN_SUBSCRIBER_ID,
					{ subscriberId: match[1] }
				)
			);
		}
		return Promise.reject(
			new Howhap(
				errors.UNKNOWN,
				{ error: err }
			)
		);
	}

	function getSubscriberId(fn) {
		return function() {
			if(arguments.length > 0 && _.isInteger(arguments[0])) {
				return fn.apply(null, arguments);
			}
			else if(arguments.length > 1 && _.isString(arguments[0]) && _.isString(arguments[1])) {
				return Subscriber
				.forge({type: arguments[0], key: arguments[1]})
				.fetch()
				.then((subscriber) => {
					if(!subscriber) {
						return Promise.reject(
							new Howhap(
								errors.UNKNOWN_SUBSCRIBER,
								{ type: arguments[0], key: arguments[1] }
							)
						);
					}
					let args = Array.prototype.slice.call(arguments, 2);
					args.unshift(subscriber.id);
					return fn.apply(null, args);
				})
				.catch((err) => {
					if(err instanceof Howhap) {
						return Promise.reject(err);
					}
					return Promise.reject(
						new Howhap(
							errors.UNKNOWN,
							{ error: err }
						)
					);
				});
			}

			return Promise.reject(
				new Howhap(
					errors.UNKNOWN,
					{ error: 'Invalid type/key or subscriberId' }
				)
			);
		};
	}
	
	return {
		addSubscriber: function(type, key, userId, subscriptions) {
			let newSubscriber = new Subscriber({
				type: type,
				key: key,
				userId: userId ? userId : null
			});
			// @todo, make this a more efficient batch insert query
			return bookshelf.transaction(function(t) {
				newSubscriber.save(null, {transacting: t})
				.then(s => {
					if(Array.isArray(subscriptions) && subscriptions.length) {
						let subscriptionCollection = Subscriptions.forge(subscriptions.map(descriptor => {
							return {
								descriptor: descriptor,
								subscriberId: s.id
							};
						}));
						return Promise.all(subscriptionCollection.invoke('save', null, {transacting: t}))
						.then(t.commit)
						.catch(t.rollback);
					}
					return t.commit();
				})
				.catch(subscriberError);
			});
		},
		subscribe: getSubscriberId(function(subscriberId, descriptor) {
			if(!_.isString(descriptor) || !descriptor.length) {
				return Promise.reject(
					new Howhap(
						errors.BAD_SUBSCRIPTION_DESCRIPTOR,
						{ descriptor: descriptor, type: typeof descriptor }
					)
				);
			}
			let subscription = new Subscription({
				descriptor: descriptor,
				subscriberId: subscriberId
			});
			return subscription.save().catch(subscriptionError);
		}),
		unsubscribe: getSubscriberId(function(subscriberId, descriptor, reason) {
			if(!_.isString(descriptor) || !descriptor.length) {
				return Promise.reject(
					new Howhap(
						errors.BAD_SUBSCRIPTION_DESCRIPTOR,
						{ descriptor: descriptor, type: typeof descriptor }
					)
				);
			}
			let subscription = new Subscription({
				descriptor: descriptor,
				subscriberId: subscriberId
			});
			return subscription
			.fetch()
			.then((subscription) => {
				if(!subscription) {
					return Promise.reject(
						new Howhap(
							errors.UNKNOWN_SUBSCRIPTION,
							{ subscriberId: subscriberId, descriptor: descriptor }
						)
					);
				}
				reason = reason ? reason+'' : '';
				let unsubscription = new Unsubscription({
					subscriptionId: subscription.id,
					reason: reason
				});
				return unsubscription
				.save()
				.catch(unsubscriptionError);
			});
		}),
		send: function(descriptor, customParams, force) {
			let info = null;
			let uriParams = null;
			for(let i=0; i<parsedRoutes.length; i++) {
				info = parsedRoutes[i];
				uriParams = info.route.match(descriptor);
				if(uriParams) {
					break;
				}
			}

			if(uriParams === null) {
				return Promise.reject(
					new Howhap(
						errors.MISSING_HANDLER,
						{ descriptor: descriptor }
					)
				);
			}

			const viewPath = path.join(config.rootPath, 'views', 'notification');
			let numFoundUsers = null;
			let totalNotificationsQueued = 0;
			let page = 0;
			let queue = async.queue(
				send(viewPath, config.notification),
				config.notification.concurrency
			);
			let where = {
				'subscriptions.descriptor': descriptor,
				'users.deletedAt': null
			};
			if(!force) {
				where['unsubscriptions.id'] = null;
			}

			return new Promise((resolve, reject) => {
				async.doUntil(
					// Grab users
					cb => {
						page++;
						let query = knex
						.select('users.*', 'subscribers.type', 'subscribers.key', 'subscriptions.id as subscriptionId')
						.from('subscriptions')
						.innerJoin('subscribers', 'subscriptions.subscriberId', 'subscribers.id')
						.leftJoin('users', 'subscribers.userId', 'users.id');
						if(!force) {
							query = query.leftJoin(
								'unsubscriptions',
								'subscriptions.id',
								'unsubscriptions.subscriptionId'
							);
						}
						
						query.where(where)
						.limit(config.notification.batchSize)
						.offset((page-1)*config.notification.batchSize)
						.then(users => {
							numFoundUsers = users.length;
							totalNotificationsQueued += numFoundUsers;
							let tasks = users.map(user => {
								let type = user.type;
								let key = user.key;
								let subscriptionId = user.subscriptionId;
								delete user.type;
								delete user.key;
								delete user.subscriptionId;
								return {
									user: user,
									type: type,
									key: key,
									subscriptionId: subscriptionId,
									customParams: customParams,
									uriParams: uriParams,
									handler: info.handler
								};
							});
							queue.push(tasks, err => {
								if(err) {
									logger.warn(err.toString());
								}
							});
							cb();
						});

					},
					// Test if userList is empty
					() => {
						return numFoundUsers < config.notification.batchSize;
					},
					// Finished
					err => {
						if(err) {
							return reject(
								new Howhap(
									errors.UNKNOWN,
									{ error: err.toString() }
								)
							);
						}
						console.log('finished queueing', totalNotificationsQueued);
						queue.drain = () => {
							console.log('queue drained');
							resolve(totalNotificationsQueued);
						};
					}
				);
			});
		}
	};
};