const path = require('path');

const bodyParser = require('koa-bodyparser');
const configLoader = require('co-env');
const fs = require('fs-extra');
const Koa = require('koa');

const checkPath = require('./check-path');
const Controller = require('./Controller');
const errors = require('./errors');
const getStack = require('./get-stack');
const ModuleList = require('./ModuleList');

module.exports = async (configPath = 'config') => {
  const stack = getStack();
  stack.shift();
  const callingFilePath = stack.shift().getFileName();
  const rootDir = path.dirname(callingFilePath);

  if(!path.isAbsolute(configPath)) {
    configPath = path.join(rootDir, configPath);
  }

  try {
    await fs.access(configPath);
  }
  catch(error) {
    throw new Error(`The supplied configuration path "${configPath}" doesn't exist.`);
  }

  const env = process.env.NODE_ENV || 'development';
  const config = configLoader(configPath, env);
  config.env = env;
  config.perk = config.perk || {};
  config.perk.paths = config.perk.paths || {};
  const paths = config.perk.paths;

  if(config.auth && !config.database) {
    throw new Error(
      'The database feature must be enabled in your config in order to use the auth feature.'
    );
  }

  // Set default paths
  const defaultControllerPath = path.join(rootDir, 'controllers');
  const defaultEmailsPath = path.join(rootDir, 'emails');
  const defaultLibrariesPath = path.join(rootDir, 'libraries');
  const defaultModelsPath = path.join(rootDir, 'models');

  // Make sure each directory exists
  paths.controllers = await checkPath(
    'perk.paths.controllers',
    configPath,
    paths.controllers,
    defaultControllerPath
  );
  if(config.email) {
    paths.emails = await checkPath(
      'perk.paths.emails',
      configPath,
      paths.emails,
      defaultEmailsPath
    );
  }
  paths.libraries = await checkPath(
    'perk.paths.libraries',
    configPath,
    paths.libraries,
    defaultLibrariesPath
  );
  if(config.database) {
    paths.models = await checkPath(
      'perk.paths.models',
      configPath,
      paths.models,
      defaultModelsPath
    );
  }

  const modules = new ModuleList();
  modules.add('core', '', 'config', config);

  if(config.auth) {
    modules.add('models', path.join(__dirname, 'models'), 'user.js');
    modules.add('models', path.join(__dirname, 'models'), 'credential.js');
  }
  if(config.database) {
    modules.add('core', path.join(__dirname, 'core'), 'database.js');
  }
  if(config.email) {
    modules.add('core', path.join(__dirname, 'core'), 'email.js');
  }

  modules.resolve();

  // // Load controllers / routes
  // const controllerFiles = await fs.readdir(paths.controllers);
  // const routes = [];

  // for(const file of controllerFiles) {
  //   const controller = require(path.join(paths.controllers, file));
  //   if(!controller.routes || !Array.isArray(controller.routes)) {
  //     throw new Error(
  //       `Controller ${file} must export an array of routes in the routes param.`
  //     );
  //   }
  //   if(!controller.prefix) {
  //     throw new Error(
  //       `Controller ${file} must export a prefix in the prefix param.`
  //     );
  //   }
  //   const controllerRoutes = controller.routes.map(route => {
  //     const pattern = path.join(`/${controller.prefix}`, route.pattern);
  //     return { ...route, pattern };
  //   });

  //   routes.push(...controllerRoutes);
  // }

  // // Load models
  // dependencies.models = await requireDir(paths.models);

  // // Load libraries
  // dependencies.libraries = await requireDir(paths.libraries);

  // const resolver = createDependencyResolver(dependencies);
  // const unresolved = resolver();
  // console.log(unresolved);
  // console.log(dependencies);

};

module.exports.Controller = Controller;
module.exports.errors = errors;
