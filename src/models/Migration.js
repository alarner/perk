const Sequelize = require('sequelize');
const Umzug = require('umzug');

module.exports = ({ database, config }) => {
  const Migration = database.define('migrations', {
    id: {
      allowNull: false,
      autoIncrement: true,
      field: 'id',
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      allowNull: false,
      field: 'name',
      type: Sequelize.STRING,

    },
    createdAt: {
      allowNull: false,
      field: 'created_at',
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: true,
      field: 'updated_at',
      type: Sequelize.DATE,
    },
  });
  Migration.migrate = async function() {
    const model = this;
    const umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: {
        sequelize: database,
        model
      },

      migrations: {
        params: [
          database.getQueryInterface(),
          database.constructor,
          function() {
            throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
          }
        ],
        path: config.perk.paths.migrations,
        pattern: /\.js$/
      },
    });
    return await umzug.up();
  };
  return Migration;
};
module.exports.requires = [ 'database', 'config' ];
