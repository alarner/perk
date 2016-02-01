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
	DUPLICATE_UNSUBSCRIPTION: {
		message: 'User has already unsubscribed from subscriptionId {{ subscriptionId }}.',
		status: 409
	},
	UNKNOWN_SUBSCRIBER_ID: {
		message: 'The subscriber id {{ subscriberId }} does not match an existing record.',
		status: 404
	},
	UNKNOWN_SUBSCRIBER: {
		message: 'There is no subscriber with a type of "{{ type }}" and a key of "{{ key }}".',
		status: 404
	},
	UNKNOWN_SUBSCRIPTION: {
		message: 'There is no subscription with a subscriberId of {{ subscriberId }} and descriptor "{{ descriptor }}".',
		status: 404
	},
	BAD_SUBSCRIPTION_DESCRIPTOR: {
		message: '"{{ subscriberId }}" (type = {{ type }}) is not a valid subscription descriptor.',
		status: 400
	},
	MISSING_HANDLER: {
		message: 'There is no matching handler for the pattern "{{ descriptor }}"',
		status: 404
	}
};