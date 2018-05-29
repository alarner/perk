const Sequelize = require('sequelize');

module.exports = ({ database, models }) => {
  const Credential = database.define('credentials', {
    id: {
      allowNull: false,
      autoIncrement: true,
      field: 'id',
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    type: {
      allowNull: false,
      field: 'type',
      type: Sequelize.STRING,
    },
    identifier: {
      allowNull: false,
      field: 'identifier',
      type: Sequelize.STRING,
    },
    secret: {
      allowNull: false,
      field: 'secret',
      type: Sequelize.STRING,
    },
    data: {
      allowNull: false,
      field: 'data',
      type: Sequelize.JSON,
    },
    userId: {
      allowNull: false,
      field: 'user_id',
      type: Sequelize.INTEGER,
    },
    status: {
      allowNull: false,
      field: 'status',
      type: Sequelize.STRING,
      defaultValue: 'unverified',
    },
    expiresAt: {
      allowNull: true,
      field: 'expires_at',
      type: Sequelize.DATE,
    },
    createdAt: {
      allowNull: false,
      field: 'created_at',
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      allowNull: true,
      field: 'updated_at',
      type: Sequelize.DATE,
    },
    deletedAt: {
      allowNull: true,
      field: 'deleted_at',
      type: Sequelize.DATE,
    },
  });

  Credential.types = {
    LOCAL: 'local',
    RESET_PASSWORD: 'reset_password'
  };
  return Credential;
};
module.exports.requires = [ 'database' ];
