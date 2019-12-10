#!/usr/bin/env node

const commander = require('commander');
commander
  .command('migrator', 'a collection of tools for database migrations')
  .parse(process.argv);
