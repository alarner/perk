#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const commander = require('commander');

const { migrator, configBuilder } = require('../index');

const configPath = path.join(process.cwd(), 'config.js');
if(!fs.existsSync(configPath)) {
	console.log(`No config file found at ${configPath} ... please run this command from the same directory where the config file is located.`);
	process.exit(1);
}

const config = configBuilder(require(configPath));

const m = migrator(config);

commander
	.command('create <name>')
	.description('create a new migration with the specified name')
	.action(async name => {
		try {
			await m.create(name);
			process.exit(0);
		}
		catch(error) {
			console.log(error);
			process.exit(1);
		}
	});

commander
	.command('latest')
	.description('upgrades the database to the newest version')
	.action(async name => {
		try {
			await m.latest();
			process.exit(0);
		}
		catch(error) {
			console.log(error);
			process.exit(1);
		}
	});

commander
	.command('rollback')
	.description('rolls the database back to the previous version')
	.action(async name => {
		try {
			await m.rollback();
			process.exit(0);
		}
		catch(error) {
			console.log(error);
			process.exit(1);
		}
	});

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
