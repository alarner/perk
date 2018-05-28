const Sequelize = require('sequelize');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

module.exports = ({ database, config, errors, models }) => {
  const User = database.define('users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      field: 'id',
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    email: {
      allowNull: false,
      field: 'email',
      type: Sequelize.STRING,
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

  User.errors = {
    MissingEmail: errors.BadRequest(
      'User is missing an email.',
      'MissingEmail',
      'email'
    ),
    InvalidEmail: errors.BadRequest(
      'Invalid email address supplied.',
      'InvalidEmail',
      'email'
    ),
    MissingPassword: errors.BadRequest(
      'User is missing a password.',
      'MissingPassword',
      'password'
    ),
    EmailExists: errors.Conflict(
      'A user with that email has already registered.',
      'EmailExists',
      'email'
    )
  };

  User.prototype.addCredential = async function(type, identifier, secret, data = {}, trx = null) {
    if(!type) {
      throw new Error('User.prototype.addCredential requires a type.');
    }
    if(!Object.values(models.Credential.types).includes(type)) {
      throw new Error(`Invalid credential type "${type}".`);
    }
    if(!identifier) {
      throw new Error('User.prototype.addCredential requires an identifier.');
    }
    if(!secret) {
      throw new Error('User.prototype.addCredential requires a secret.');
    }
    const options = {};
    if(trx) {
      options.transaction = trx;
    }

    let credential = await models.Credential.findOne(
      {
        where: { type, identifier, userId: this.id }
      },
      options
    );
    if(credential) {
      throw new User.errors.EmailExists();
    }
    credential = { type, identifier, secret, data, userId: this.id };
    return await models.Credential.create(credential, options);
  };

  User.register = async function(email, password, data = {}) {
    if(!email) {
      throw new User.errors.MissingEmail();
    }
    if(!validator.isEmail(email)) {
      throw new User.errors.InvalidEmail();
    }
    if(!password) {
      throw new User.errors.MissingPassword();
    }
    email = email.toLowerCase();
    return await database.transaction(async (transaction) => {
      let user = await User.findOne({ where: { email } }, { transaction });
      if(!user) {
        user = await User.create({ email }, { transaction });
      }
      const secret = await User.hash(password);
      await user.addCredential(models.Credential.types.LOCAL, email, secret, data, transaction);
      return user;
    });
  };

  User.hash = async function(password) {
    const salt = await bcrypt.genSalt(config.authentication.rounds);
    return await bcrypt.hash(password, salt);
  };

  return User;
};
module.exports.requires = [ 'database', 'config', 'errors', 'models/Credential' ];
