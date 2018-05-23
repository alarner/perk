module.exports = function() {
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack) { return stack; };
  var err = new Error;
  Error.captureStackTrace(err);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  stack.shift();
  return stack;
};
