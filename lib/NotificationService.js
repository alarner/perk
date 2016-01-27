let Subscriber = require('../models/Subscriber');
let Subscriptions = require('../collections/Subscriptions');
let Subscription = require('../models/Subscription');
let Howhap = require('howhap');
let errors = require('../errors/notification');
let _ = require('lodash')
module.exports = function() {

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
						let subscriptionCollection = Subscriptions.forge(subscriptions.map(subscription => {
							subscription.subscriberId = s.id;
							return subscription;
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
		subscribe: function(subscriberId, descriptor) {
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
		},
		unsubscribe: function() {

		},
		send: function() {

		}
	};
};