const _ = require('lodash');
const Sequelize = require('sequelize');

module.exports = ({ config }) => {
  const { name, user, password } = config.database;
  return new Sequelize(
    name,
    user,
    password,
    _.omit(config.database, ['name', 'user', 'password' ])
  );
};
