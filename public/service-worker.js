self.addEventListener('push', function(event) {
	console.log('Received a push message', event);

	var notificationOptions = {
		body: 'Lipsum',
		icon: '/images/touch/chrome-touch-icon-192x192.png',
		tag: 'simple-push-demo-notification',
		data: {url: 'http://test.com'}
	};
	return self.registration.showNotification('An example push notification', notificationOptions);

	// // Since this is no payload data with the first version
	// // of Push notifications, here we'll grab some data from
	// // an API and use it to populate a notification
	// event.waitUntil(
	//   fetch(YAHOO_WEATHER_API_ENDPOINT)
	//     .then(function(response) {
	//       if (response.status !== 200) {
	//         // Throw an error so the promise is rejected and catch() is executed
	//         throw new Error('Invalid status code from weather API: ' +
	//           response.status);
	//       }

	//       // Examine the text in the response
	//       return response.json();
	//     })
	//     .then(function(data) {
	//       console.log('Weather API data: ', data);
	//       if (data.query.count === 0) {
	//         // Throw an error so the promise is rejected and catch() is executed
	//         throw new Error();
	//       }

	//       var title = 'What\'s the weather like in London?';
	//       var message = data.query.results.channel.item.condition.text;
	//       var icon = data.query.results.channel.image.url ||
	//         'images/touch/chrome-touch-icon-192x192.png';

	//       // Add this to the data of the notification
	//       var urlToOpen = data.query.results.channel.link;

	//       var notificationFilter = {
	//         tag: 'simple-push-demo-notification'
	//       };

	//       var notificationData = {
	//         url: urlToOpen
	//       };

	//       if (!self.registration.getNotifications) {
	//         return showNotification(title, message, icon, notificationData);
	//       }

	//       // Check if a notification is already displayed
	//       return self.registration.getNotifications(notificationFilter)
	//         .then(function(notifications) {
	//           if (notifications && notifications.length > 0) {
	//             // Start with one to account for the new notification
	//             // we are adding
	//             var notificationCount = 1;
	//             for (var i = 0; i < notifications.length; i++) {
	//               var existingNotification = notifications[i];
	//               if (existingNotification.data &&
	//                 existingNotification.data.notificationCount) {
	//                 notificationCount +=
	//                   existingNotification.data.notificationCount;
	//               } else {
	//                 notificationCount++;
	//               }
	//               existingNotification.close();
	//             }
	//             message = 'You have ' + notificationCount +
	//               ' weather updates.';
	//             notificationData.notificationCount = notificationCount;
	//           }

	//           return showNotification(title, message, icon, notificationData);
	//         });
	//     })
	//     .catch(function(err) {
	//       console.error('A Problem occured with handling the push msg', err);

	//       var title = 'An error occured';
	//       var message = 'We were unable to get the information for this ' +
	//         'push message';

	//       return showNotification(title, message);
	//     })
	// );
});

self.addEventListener('notificationclick', function(event) {
	console.log(event);
  // var url = event.notification.data.url;
  // event.notification.close();
  // event.waitUntil(clients.openWindow(url));
});
