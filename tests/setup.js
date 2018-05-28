const path = require('path');
const createDatabase = require('../src/core/database');
const createMigration = require('../src/models/Migration');
const createUser = require('../src/models/User');
const createCredential = require('../src/models/Credential');
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
      migrations: path.join(__dirname, '..', 'src', 'migrations')
    }
  },
  authentication: {
    rounds: 10
  }
}
before(function() {
  this.config = config;
  this.database = createDatabase({ config });
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
