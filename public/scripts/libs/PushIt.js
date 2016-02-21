module.exports = {
	subscribe: function(workerPath, options={}) {
		console.log(1);
		return new Promise((resolve, reject) => {
			console.log(2);
			if(!('serviceWorker' in navigator)) {
				return reject('UNSUPPORTED');
			}

			if(!('PushManager' in window)) {
				return reject('UNSUPPORTED');
			}

			if(!('permissions' in navigator)) {
				return reject('UNSUPPORTED');
			}

			if(!('showNotification' in ServiceWorkerRegistration.prototype)) {
				return reject('UNSUPPORTED');
			}

			console.log(3);

			navigator.serviceWorker.register(workerPath, options);
			navigator.serviceWorker.ready
			.then((serviceWorkerRegistration) => {
				console.log(4);
				return serviceWorkerRegistration.pushManager.subscribe(
					{userVisibleOnly: options.userVisibleOnly || true}
				);
			})
			.then(subscription => {
				console.log(5);
				let subscriptionId = getSubscriptionId(subscription.endpoint);
				if(!subscriptionId) {
					reject('UNKNOWN_SUBSCRIPTION_ID');
				}
				else {
					resolve(subscriptionId);
				}
			})
			.catch(reject);
		});
	},
	unsubscribe: function(options) {
		return new Promise((resolve, reject) => {
			navigator.serviceWorker.ready
			.then((serviceWorkerRegistration) => {
				return serviceWorkerRegistration.pushManager.getSubscription();
			})
			.then((subscription) => {
				// Check we have everything we need to unsubscribe
				if(!subscription) {
					return resolve(null);
				}

				subscription.unsubscribe()
				.then(function(successful) {
					if(!successful) {
						reject('CANNOT_UNSUBSCRIBE');
					}
					else {
						resolve(getSubscriptionId(subscription.endpoint));
					}
				})
				.catch(reject);
			});
		});
	}
};

function getSubscriptionId(url) {
	return url.split('/').pop();
}