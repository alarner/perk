const path = require('path');

const nodemailer = require('nodemailer');
const templateEngine = require('consolidate');
const fs = require('fs-extra');
const _ = require('lodash');
const validator = require('validator');

const listDir = require('../list-dir');

module.exports = async ({ config }) => {
  if(!config.email) {
    throw new Error('email configuration is required.');
  }
  if(!config.email.transport) {
    throw new Error('email configuration with a transport property is required.');
  }
  if(!config.email.templateEngine) {
    throw new Error('email configuration with a templateEngine property is required.');
  }
  const emailer = nodemailer.createTransport(config.email.transport);
  const renderer = templateEngine[config.email.templateEngine];
  const templateFiles = await listDir(config.perk.paths.emails);
  const metaFiles = templateFiles.filter(f => f.endsWith('/meta.js'));
  const templates = await Promise.all(metaFiles.map(async (file) => {
    const directory = path.dirname(file);
    const descriptor = _.trim(directory.substr(config.perk.paths.emails.length), path.sep);
    const meta = require(file);
    if(!meta.subject) {
      throw new Error(`Email template "${descriptor}" is missing a subject (meta.js)`);
    }
    if(!meta.from) {
      throw new Error(`Email template "${descriptor}" is missing a from address (meta.js)`);
    }
    if(!validator.isEmail(meta.from, { allow_display_name: true })) {
      throw new Error(`Email template "${descriptor}" has an invalid from address (meta.js)`);
    }
    const content = {};
    try {
      content.html = await fs.readFile(path.join(directory, 'content.html'));
    }
    catch(error) {
      if(error.code !== 'ENOENT') {
        throw error;
      }
      throw new Error(`Email template "${descriptor}" is missing a HTML template (content.html)`);
    }
    try {
      content.text = await fs.readFile(path.join(directory, 'content.txt'));
    }
    catch(error) {
      if(error.code !== 'ENOENT') {
        throw error;
      }
      throw new Error(`Email template "${descriptor}" is missing a text template (content.txt)`);
    }
    return {
      descriptor,
      meta,
      html: content.html.toString(),
      text: content.text.toString(),
    };
  }));
  return function email(email, descriptor, params) {
    const template = templates.find(t => t.descriptor === descriptor);
    if(!template) {
      throw new Error(`Could not find template with descriptor ${descriptor}`);
    }
  }
};
module.exports.requires = [ 'config' ];
