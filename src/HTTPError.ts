export class HTTPError extends Error {
	name: string;
	status: number;
	constructor(message: string) {
		super(message);
		// Ensure the name of this error is the same as the class name
		this.name = this.constructor.name;
		// This clips the constructor invocation from the stack trace.
		// It's not absolutely essential, but it does make the stack trace a little nicer.
		// https://rclayton.silvrback.com/custom-errors-in-node-js
		Error.captureStackTrace(this, this.constructor);
	}
}

export class BadRequest extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 400;
	}
}

export class Unauthorized extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 401;
	}
}

export class PaymentRequired extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 402;
	}
}

export class Forbidden extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 403;
	}
}

export class NotFound extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 404;
	}
}

export class MethodNotAllowed extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 405;
	}
}

export class NotAcceptable extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 406;
	}
}

export class ProxyAuthenticationRequired extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 407;
	}
}

export class RequestTimeout extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 408;
	}
}

export class Conflict extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 409;
	}
}

export class Gone extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 410;
	}
}

export class LengthRequired extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 411;
	}
}

export class PreconditionFailed extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 412;
	}
}

export class PayloadTooLarge extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 413;
	}
}

export class URITooLong extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 414;
	}
}

export class UnsupportedMediaType extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 415;
	}
}

export class RangeNotSatisfiable extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 416;
	}
}

export class ExpectationFailed extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 417;
	}
}

export class MisdirectedRequest extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 421;
	}
}

export class UnprocessableEntity extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 422;
	}
}

export class Locked extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 423;
	}
}

export class FailedDependency extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 424;
	}
}

export class TooEarly extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 425;
	}
}

export class UpgradeRequired extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 426;
	}
}

export class PreconditionRequired extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 428;
	}
}

export class TooManyRequests extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 429;
	}
}

export class RequestHeaderFieldsTooLarge extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 431;
	}
}

export class UnavailableForLegalReasons extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 451;
	}
}

export class InternalServerError extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 500;
	}
}

export class NotImplemented extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 501;
	}
}

export class BadGateway extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 502;
	}
}

export class ServiceUnavailable extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 503;
	}
}

export class GatewayTimeout extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 504;
	}
}

export class HTTPVersionNotSupported extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 505;
	}
}

export class VariantAlsoNegotiates extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 506;
	}
}

export class InsufficientStorage extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 507;
	}
}

export class LoopDetected extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 508;
	}
}

export class NotExtended extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 510;
	}
}

export class NetworkAuthenticationRequired extends HTTPError {
	constructor(message: string) {
		super(message);
		this.status = 511;
	}
}
