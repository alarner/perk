class HTTPError extends Error {
	constructor(message) {
		super(message);
		// Ensure the name of this error is the same as the class name
		this.name = this.constructor.name;
		// This clips the constructor invocation from the stack trace.
		// It's not absolutely essential, but it does make the stack trace a little nicer.
		//  @see Node.js reference (bottom)
		Error.captureStackTrace(this, this.constructor);
	}
}

class BadRequest extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 400;
	}
}

class Unauthorized extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 401;
	}
}

class PaymentRequired extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 402;
	}
}

class Forbidden extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 403;
	}
}

class NotFound extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 404;
	}
}

class MethodNotAllowed extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 405;
	}
}

class NotAcceptable extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 406;
	}
}

class ProxyAuthenticationRequired extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 407;
	}
}

class RequestTimeout extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 408;
	}
}

class Conflict extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 409;
	}
}

class Gone extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 410;
	}
}

class LengthRequired extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 411;
	}
}

class PreconditionFailed extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 412;
	}
}

class PayloadTooLarge extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 413;
	}
}

class URITooLong extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 414;
	}
}

class UnsupportedMediaType extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 415;
	}
}

class RangeNotSatisfiable extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 416;
	}
}

class ExpectationFailed extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 417;
	}
}

class MisdirectedRequest extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 421;
	}
}

class UnprocessableEntity extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 422;
	}
}

class Locked extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 423;
	}
}

class FailedDependency extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 424;
	}
}

class TooEarly extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 425;
	}
}

class UpgradeRequired extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 426;
	}
}

class PreconditionRequired extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 428;
	}
}

class TooManyRequests extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 429;
	}
}

class RequestHeaderFieldsTooLarge extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 431;
	}
}

class UnavailableForLegalReasons extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 451;
	}
}

class InternalServerError extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 500;
	}
}

class NotImplemented extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 501;
	}
}

class BadGateway extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 502;
	}
}

class ServiceUnavailable extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 503;
	}
}

class GatewayTimeout extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 504;
	}
}

class HTTPVersionNotSupported extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 505;
	}
}

class VariantAlsoNegotiates extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 506;
	}
}

class InsufficientStorage extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 507;
	}
}

class LoopDetected extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 508;
	}
}

class NotExtended extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 510;
	}
}

class NetworkAuthenticationRequired extends HTTPError {
	constructor(message) {
		super(message);
		this.status = 511;
	}
}

module.exports = {
	HTTPError,
	BadRequest,
	Unauthorized,
	PaymentRequired,
	Forbidden,
	NotFound,
	MethodNotAllowed,
	NotAcceptable,
	ProxyAuthenticationRequired,
	RequestTimeout,
	Conflict,
	Gone,
	LengthRequired,
	PreconditionFailed,
	PayloadTooLarge,
	URITooLong,
	UnsupportedMediaType,
	RangeNotSatisfiable,
	ExpectationFailed,
	MisdirectedRequest,
	UnprocessableEntity,
	Locked,
	FailedDependency,
	TooEarly,
	UpgradeRequired,
	PreconditionRequired,
	TooManyRequests,
	RequestHeaderFieldsTooLarge,
	UnavailableForLegalReasons,
	InternalServerError,
	NotImplemented,
	BadGateway,
	ServiceUnavailable,
	GatewayTimeout,
	HTTPVersionNotSupported,
	VariantAlsoNegotiates,
	InsufficientStorage,
	LoopDetected,
	NotExtended,
	NetworkAuthenticationRequired
};