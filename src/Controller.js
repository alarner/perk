module.exports = class Controller {

  constructor(prefix, routes, validator, errors) {
    this.prefix = prefix;
    this.routes = routes;
    this.validator = validator;
    this.errors = errors;
  }

};
