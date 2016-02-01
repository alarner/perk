let nodemailer = require('nodemailer');
let path = require('path');
let async = require('async');
let templateLoader = require('../template-loader');
let _ = require('lodash');

module.exports = function(task, handlerConfig, viewPath, notificationConfig, cb) {
	async.parallel(
		{
			text: cb => {
				templateLoader(
					path.join(viewPath, task.handler, 'email', 'body.text.ejs'),
					cb
				);
			},
			html: cb => {
				templateLoader(
					path.join(viewPath, task.handler, 'email', 'body.html.ejs'),
					cb
				);
			}
		},
		(err, templates) => {
			let transporter = nodemailer.createTransport(
				notificationConfig.adapter.email.transportString
			);

			let to = task.key;
			let prefix = '';
			if(task.user.firstName) {
				prefix = task.user.firstName;
				if(task.user.lastName) {
					prefix += ' '+task.user.lastName;
				}
			}

			if(prefix) {
				to = prefix + '<'+to+'>';
			}

			transporter.sendMail(
				{
					from: handlerConfig.from,
					to: to,
					subject: _.template(handlerConfig.subject)(task),
					text: templates.text(task),
					html: templates.html(task)
				},
				function(error, info){
					if(error){
						return console.log(error);
					}
					console.log('Message sent: ' + info.response);
					cb(error, info);
				}
			);
		}
	);
};