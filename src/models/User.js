const Sequelize = require('sequelize');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { DateTime } = require('luxon');

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
      'Action requires an email.',
      'MissingEmail',
      'email'
    ),
    InvalidEmail: errors.BadRequest(
      'Invalid email address supplied.',
      'InvalidEmail',
      'email'
    ),
    UserWithEmailNotFound: errors.BadRequest(
      'No user with the supplied email address could be found.',
      'UserWithEmailNotFound',
      'email'
    ),
    MissingPassword: errors.BadRequest(
      'Action requires a password.',
      'MissingPassword',
      'password'
    ),
    EmailExists: errors.Conflict(
      'A user with that email has already registered.',
      'EmailExists',
      'email'
    )
  };

  User.prototype.addCredential = async function(credential = {}, transaction = null) {
    let { type, identifier, secret, data, expiresAt } = credential;
    data = data || {};
    expiresAt = expiresAt || null;
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
    if(transaction) {
      options.transaction = transaction;
    }

    let cred = await models.Credential.findOne(
      {
        where: { type, identifier, userId: this.id }
      },
      options
    );
    if(cred) {
      throw new User.errors.EmailExists();
    }
    cred = { type, identifier, secret, data, expiresAt, userId: this.id };
    return await models.Credential.create(cred, options);
  };

  User.prototype.storeToken = async function(type) {
    if(!Object.keys(config.authentication.token).includes(type)) {
      throw new Error(`Invalid token type "${type}".`);
    }
    if(!Object.values(models.Credential.types).includes(type)) {
      throw new Error(`Invalid credential type "${type}".`);
    }
    if(!config.authentication.token[type].length) {
      throw new Error(`Token type "${type}" missing length in authntication config.`);
    }
    const token = await User.generateToken(config.authentication.token[type].length);
    const credential = {
      type,
      identifier: token,
      secret: token,
    };
    if(config.authentication.token[type].expireMs) {
      credential.expiresAt = DateTime.utc().plus(config.authentication.token[type].expireMs);
    }
    return this.addCredential(credential);
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
      await user.addCredential(
        {
          type: models.Credential.types.LOCAL,
          identifier: email,
          secret,
          data,
        },
        transaction
      );
      return user;
    });
  };

  User.hash = async function(password) {
    const salt = await bcrypt.genSalt(config.authentication.rounds);
    return await bcrypt.hash(password, salt);
  };

  User.generateToken = function(length) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (error, buffer) => {
        if(error) return reject(error);
        resolve(
          buffer
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/\=/g, '')
          .substr(0, length)
        );
      });
    });
  };

  User.initiatePasswordRecovery = async function(userEmail, email, template) {
    if(!userEmail) {
      throw new User.errors.MissingEmail();
    }
    if(!validator.isEmail(userEmail)) {
      throw new User.errors.InvalidEmail();
    }
    userEmail = userEmail.toLowerCase();
    const user = await User.findOne({ where: { email: userEmail } });
    if(!user) {
      throw new User.errors.UserWithEmailNotFound();
    }
    const credential = await user.storeToken(models.Credential.types.RESET_PASSWORD);
    await email(template, { ...user.toJSON(), ...credential.toJSON() });
    return true;
  };

  return User;
};
module.exports.requires = [ 'database', 'config', 'errors', 'models/Credential' ];
