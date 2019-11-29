const path = require('path');

const _ = require('lodash');
const configLoader = require('co-env');
const fs = require('fs-extra');

const checkPath = require('./check-path');
const errors = require('./errors');
const getStack = require('./get-stack');
const listDir = require('./list-dir');
const ModuleList = require('./ModuleList');

module.exports = async (configPath) => {
  // Load the config
  const stack = getStack();
  while(stack[0].getFileName().substr(0, __dirname.length) === __dirname) {
    stack.shift();
  }
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
  const defaultConfig = configLoader(path.join(__dirname, 'config-defaults'), env);
  const userConfig = configLoader(configPath, env);
  const config = _.merge({}, defaultConfig, userConfig);
  config.env = env;
  const paths = config.perk.paths;

  const features = {
    database: Boolean(userConfig.database),
    authentication: Boolean(userConfig.authentication),
    email: Boolean(userConfig.email)
  };

  // Feature specific validation
  if(features.authentication && !features.database) {
    throw new Error(
      'The database feature must be enabled in your config in order to use the authentication ' +
      'feature.'
    );
  }

  // Set default paths
  const defaultControllerPath = path.join(rootDir, 'controllers');
  const defaultEmailsPath = path.join(rootDir, 'emails');
  const defaultLibrariesPath = path.join(rootDir, 'libraries');
  const defaultModelsPath = path.join(rootDir, 'models');
  const defaultMigrationsPath = path.join(rootDir, 'migrations');

  // Make sure each directory exists
  paths.controllers = await checkPath(
    'perk.paths.controllers',
    configPath,
    paths.controllers,
    defaultControllerPath
  );
  if(features.email) {
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
  if(features.database) {
    paths.models = await checkPath(
      'perk.paths.models',
      configPath,
      paths.models,
      defaultModelsPath
    );
    paths.models = await checkPath(
      'perk.paths.migrations',
      configPath,
      paths.migrations,
      defaultMigrationsPath
    );
  }

  // Load all of the necessary core modules
  const modules = new ModuleList();
  modules.add('core', '', 'config', config);
  modules.add('core', '', 'errors', errors);
  modules.add('core', path.join(__dirname, 'core'), 'logger.js');

  if(features.authentication) {
    modules.add('models', path.join(__dirname, 'models'), 'User.js');
    modules.add('models', path.join(__dirname, 'models'), 'Credential.js');
  }
  if(features.database) {
    modules.add('core', path.join(__dirname, 'core'), 'database.js');
    modules.add('models', path.join(__dirname, 'models'), 'Migration.js');
  }
  if(features.email) {
    modules.add('core', path.join(__dirname, 'core'), 'email.js');
  }

  await modules.resolve();

  // Load all of the customer user modules
  const userModulePaths = {
    libraries: await listDir(paths.libraries)
  };

  if(features.database) {
    userModulePaths.models = await listDir(paths.models);
  }

  const userModules = new ModuleList(modules);
  for(const descriptor in userModulePaths) {
    userModulePaths[descriptor].forEach(
      p => userModules.add(descriptor, paths[descriptor], p.substr(paths[descriptor].length))
    );
  }

  await userModules.resolve();

  // Generate the dependency tree
  return userModules.buildAllDependencies();
};
