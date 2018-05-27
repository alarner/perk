const url = require('url');
const querystring = require('querystring');
const pathToRegexp = require('path-to-regexp');

module.exports = class Router {
  constructor(routes, dependencies) {
    this.routes = routes.map(route => {
      const keys = [];
      const regex = pathToRegexp(route.pattern, keys);
      let middleware = route.middleware || [];
      if(!Array.isArray(middleware)) {
        throw new Error(
          `Route ${route.method} ${route.pattern} has middleware that is not an array.`
        );
      }
      return {
        ...route,
        keys: keys.map(k => k.name),
        regex,
        middleware
      };
    });
    this.dependencies = dependencies;

    this.middleware = this.middleware.bind(this);
  }

  async middleware(ctx) {
    const parsedUrl = url.parse(ctx.originalUrl);
    const pathname = parsedUrl.pathname;
    const query = querystring.parse(parsedUrl.query);
    const { headers } = ctx.req;
    for(const route of this.routes) {
      const match = pathname.match(route.regex);
      if(match) {
        const params = {};
        route.keys.forEach((key, index) => {
          params[key] = match[index + 1];
        });
        const request = {
          ...this.dependencies,
          query,
          pathname,
          params,
          headers,
          body: ctx.request.body || {},
          ctx
        };
        try {
          for(const middleware of route.middleware) {
            await middleware(request);
          }
          ctx.body = await route.route(request);
        }
        catch(error) {
          if(error.isCustomError) {
            ctx.status = error.status || 500;
            ctx.body = {
              code: error.code,
              key: error.key,
              message: error.message
            };
          }
          else {
            ctx.status = error.status || 500;
            ctx.body = {
              code: 'InternalServerError',
              key: 'default',
              message: 'Internal Server Error'
            };
          }

          if(this.dependencies.config.webserver.verboseErrors) {
            let stack = [];
            if(error.stack) {
              stack = error.stack.split('\n').slice(1);
            }
            let file = '';
            if(stack[0]) {
              const match = stack[0].match(/.*\((.*?)\).*/);
              file = match[1].substr(__dirname.length);
            }
            ctx.body.file = file;
            ctx.body.stack = stack;
            ctx.body.message = error.message;
          }
        }
      }
    }
  }
};
