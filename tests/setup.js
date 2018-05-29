const path = require('path');
const createCredential = require('../src/models/Credential');
const createDatabase = require('../src/core/database');
const createEmail = require('../src/core/email');
const createMigration = require('../src/models/Migration');
const createUser = require('../src/models/User');
const errors = require('../src/errors');
const config = {
  database: {
    name: 'postgres',
    user: 'postgres',
    password: '123456',
    dialect: 'postgres',
    port: 5434,
    logging: false,
  },
  perk: {
    paths: {
      migrations: path.join(__dirname, '..', 'src', 'migrations'),
      emails: path.join(__dirname, 'fixtures', 'emails', 'valid'),
    }
  },
  authentication: {
    rounds: 10,
    token: {
      reset_password: {
        length: 15
      },
      foo_test: {
        length: 19
      },
      local: {
      }
    }
  },
  email: {
    transport: require('nodemailer-stub-transport'),
    templateEngine: 'handlebars'
  }
}
before(function() {
  this.config = config;
  this.database = createDatabase({ config });
  this.email = createEmail({ config });
  this.models = {};
  this.models.Migration = createMigration({ config, database: this.database });
  this.models.Credential = createCredential({ config, database: this.database });
  this.models.User = createUser({ config, database: this.database, models: this.models, errors });
  return this.models.Migration.migrate();
});

beforeEach(async function() {
  await this.database.query('DELETE FROM "credentials"');
  await this.database.query('DELETE FROM "users"');
});

after(async function() {
  await this.database.close();
});
