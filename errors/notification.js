module.exports = {
	UNKNOWN: {
		message: 'An unknown error occurred.',
		status: 500
	},
	DUPLICATE_SUBSCRIBER: {
		message: 'A subscriber with type "{{ type }}" and key "{{ key }}" already exists.',
		status: 409
	},
	DUPLICATE_SUBSCRIPTION: {
		message: '"{{ descriptor }}" already exists for subscriber {{ subscriberId }}.',
		status: 409
	},
	UNKNOWN_SUBSCRIBER_ID: {
		message: 'The subscriber id {{ subscriberId }} does not match an existing record.',
		status: 404
	},
	BAD_SUBSCRIPTION_DESCRIPTOR: {
		message: '"{{ subscriberId }}" (type = {{ type }}) is not a valid subscription descriptor.',
		status: 400
	}
};