const path = require('path');

const bodyParser = require('koa-bodyparser');
const fs = require('fs-extra');
const Koa = require('koa');

const buildDependencies = require('./build-dependencies');
const Controller = require('./Controller');
const errors = require('./errors');
const Router = require('./Router');

module.exports = async (configPath = 'config') => {
  const dependencies = await buildDependencies(configPath);
  const { config } = dependencies;
  const { paths } = config.perk;

  // Load controllers / routes
  const controllerFiles = await fs.readdir(paths.controllers);
  const routes = [];

  for(const file of controllerFiles) {
    const controller = require(path.join(paths.controllers, file));
    if(!controller.routes || !Array.isArray(controller.routes)) {
      throw new Error(
        `Controller ${file} must export an array of routes in the routes param.`
      );
    }
    if(!controller.prefix) {
      throw new Error(
        `Controller ${file} must export a prefix in the prefix param.`
      );
    }
    const controllerRoutes = controller.routes.map(route => {
      const pattern = path.join(`/${controller.prefix}`, route.pattern);
      return { ...route, pattern };
    });

    routes.push(...controllerRoutes);
  }

  const router = new Router(routes, dependencies);

  // Set up koa web server
  const app = new Koa();

  app.use(bodyParser());
  app.use(router.middleware);

  const port = process.env.PORT || config.webserver.port;

  const server = app.listen(port);
  dependencies.logger.info(`Started server at http://localhost:${port}`);
  return server;
};

module.exports.Controller = Controller;
module.exports.errors = errors;
