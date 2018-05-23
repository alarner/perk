const buildError = (status, code, defaultMessage) => {
  return (message, overrideCode, key) => {
    return class CustomError extends Error {
      constructor(overrideMessage) {
        super(overrideMessage || message || defaultMessage);
        this.status = status;
        this.code = overrideCode || code;
        this.key = key || 'default';
        this.isCustomError = true;
      }
    };
  };
};
module.exports = {
  BadRequest: buildError(400, 'BadRequest', 'Bad Request'),
  Unauthorized: buildError(401, 'Unauthorized', 'Unauthorized'),
  PaymentRequired: buildError(402, 'PaymentRequired', 'Payment Required'),
  Forbidden: buildError(403, 'Forbidden', 'Forbidden'),
  NotFound: buildError(404, 'NotFound', 'Not Found'),
  MethodNotAllowed: buildError(405, 'MethodNotAllowed', 'Method Not Allowed'),
  NotAcceptable: buildError(406, 'NotAcceptable', 'Not Acceptable'),
  ProxyAuthenticationRequired: buildError(407, 'ProxyAuthenticationRequired', 'Proxy Authentication Required'),
  RequestTimeout: buildError(408, 'RequestTimeout', 'Request Timeout'),
  Conflict: buildError(409, 'Conflict', 'Conflict'),
  Gone: buildError(410, 'Gone', 'Gone'),
  LengthRequired: buildError(411, 'LengthRequired', 'Length Required'),
  PreconditionFailed: buildError(412, 'PreconditionFailed', 'Precondition Failed'),
  PayloadTooLarge: buildError(413, 'PayloadTooLarge', 'Payload Too Large'),
  URITooLong: buildError(414, 'URITooLong', 'URI Too Long'),
  UnsupportedMediaType: buildError(415, 'UnsupportedMediaType', 'Unsupported Media Type'),
  RangeNotSatisfiable: buildError(416, 'RangeNotSatisfiable', 'Range Not Satisfiable'),
  ExpectationFailed: buildError(417, 'ExpectationFailed', 'Expectation Failed'),
  ImATeapot: buildError(418, 'ImATeapot', 'I\'m a teapot'),
  MisdirectedRequest: buildError(421, 'MisdirectedRequest', 'Misdirected Request'),
  UnprocessableEntity: buildError(422, 'UnprocessableEntity', 'Unprocessable Entity'),
  Locked: buildError(423, 'Locked', 'Locked'),
  FailedDependency: buildError(424, 'FailedDependency', 'Failed Dependency'),
  UpgradeRequired: buildError(426, 'UpgradeRequired', 'Upgrade Required'),
  PreconditionRequired: buildError(428, 'PreconditionRequired', 'Precondition Required'),
  TooManyRequests: buildError(429, 'TooManyRequests', 'Too Many Requests'),
  RequestHeaderFieldsTooLarge: buildError(431, 'RequestHeaderFieldsTooLarge', 'Request Header Fields Too Large'),
  UnavailableForLegalReasons: buildError(451, 'UnavailableForLegalReasons', 'Unavailable For Legal Reasons'),
  InternalServerError: buildError(500, 'InternalServerError', 'Internal Server Error'),
  NotImplemented: buildError(501, 'NotImplemented', 'Not Implemented'),
  BadGateway: buildError(502, 'BadGateway', 'Bad Gateway'),
  ServiceUnavailable: buildError(503, 'ServiceUnavailable', 'Service Unavailable'),
  GatewayTimeout: buildError(504, 'GatewayTimeout', 'Gateway Timeout'),
  HTTPVersionNotSupported: buildError(505, 'HTTPVersionNotSupported', 'HTTP Version Not Supported'),
  VariantAlsoNegotiates: buildError(506, 'VariantAlsoNegotiates', 'Variant Also Negotiates'),
  InsufficientStorage: buildError(507, 'InsufficientStorage', 'Insufficient Storage'),
  LoopDetected: buildError(508, 'LoopDetected', 'Loop Detected'),
  NotExtended: buildError(510, 'NotExtended', 'Not Extended'),
  NetworkAuthenticationRequired: buildError(511, 'NetworkAuthenticationRequired', 'Network Authentication Required'),
};
