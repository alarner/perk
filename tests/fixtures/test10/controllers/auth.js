const validator = require('validator');
const { Controller, errors } = require('../../../../src/index');

const AuthErrors = {
  MissingEmail: errors.BadRequest(
    'An email is required.',
    'MissingEmail',
    'email'
  ),
  InvalidEmail: errors.BadRequest(
    'It looks like that\'s not a valid email address.',
    'InvalidEmail',
    'email'
  ),
  MissingPassword: errors.BadRequest(
    'This call requires an gym name.',
    'MissingPassword',
    'password'
  ),
  MissingTimezone: errors.BadRequest(
    'This call requires a timezone offset.',
    'MissingTimezone',
    'timezoneOffset'
  )
};

const validators = {
  email(req) {
    if(!req.body.email) {
      throw new AuthErrors.MissingEmail();
    }
    else if(!validator.isEmail(req.body.email)) {
      throw new AuthErrors.InvalidEmail();
    }
  },
  timezoneOffset(req) {
    if(isNaN(parseInt(req.body.timezoneOffset))) {
      throw new AuthErrors.MissingTimezone();
    }
  },
  credentials(req) {
    if(!req.body.password) {
      throw new AuthErrors.MissingPassword();
    }
  }
};

const routes = [
  {
    method: 'post',
    pattern: '/email-token/login',
    middleware: [ validators.email, validators.timezoneOffset ],
    async route({ models, body }) {
      return await models.User.invite(body.email, body.timezoneOffset);
      // ctx.body = 'Login Result';
    }
  },
  {
    method: 'post',
    pattern: '/password/login',
    middleware: [ validators.credentials ],
    async route(ctx) {
      ctx.body = 'Login Result';
    }
  }
];

module.exports = new Controller('auth', routes, validator, AuthErrors);
