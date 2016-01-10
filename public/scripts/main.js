let PushIt = require('./libs/PushIt');
window.addEventListener('load', () => {
	document.getElementById('subscribe').addEventListener('click', e => {
		PushIt.subscribe('/service-worker.js?v2', {scope: './'})
		.then((subscriptionId) => {
			// let formData = new FormData();
			// formData.append('subscriptionId', subscriptionId);
			let req = new Request('/push/subscribe', {
				method: 'POST',
				body: JSON.stringify({subscriptionId: subscriptionId}),
				headers: new Headers({
					'Content-Type': 'application/json'
				})
			});
			fetch(req).then(res => {
				console.log(res);
			});
			console.log('subscribed', subscriptionId);
		});
	});
	document.getElementById('unsubscribe').addEventListener('click', e => {
		PushIt.unsubscribe()
		.then((subscriptionId) => {
			console.log('unsubscribed', subscriptionId);
		});
	});
});