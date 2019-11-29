const path = require('path');
const fs = require('fs-extra');
const Umzug = require('umzug');

const migrationTemplate =
`module.exports = {
  up(query, Sequelize) {

  },

  down(query, Sequelize) {

  }
};`;

module.exports = ({ database, models, config }) => {
  const model = migration({ db });
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: database,
      model: models.Migration
    },

    migrations: {
      params: [
        database.getQueryInterface(),
        database.constructor,
        function() {
          throw new Error(
            'Migration tried to use old style "done" callback. Please upgrade to "umzug" and ' +
            'return a promise instead.'
          );
        }
      ],
      path: config.perk.paths.migrations,
      pattern: /\.js$/
    },
  });

  return {
    up: umzug.up.bind(umzug),
    make: async (name) => {
      const date = (new Date()).getTime();
      return await fs.writeFile(path.join(migrationPath, `${date}_${name}.js`), migrationTemplate);
    }
  };
};

module.exports.requires = [ 'database', 'models/Migration', 'config' ];
