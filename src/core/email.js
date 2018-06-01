const path = require('path');

const _ = require('lodash');
const fs = require('fs-extra');
const Inky = require('react-inky').default;
const inlineCss = require('inline-css');
const listDir = require('../list-dir');
const nodemailer = require('nodemailer');
const React = require('react');
const { renderToString } = require('react-dom/server');
const validator = require('validator');

module.exports = async ({ config }) => {
  if(!config.email) {
    throw new Error('email configuration is required.');
  }
  if(!config.email.transport) {
    throw new Error('email configuration with a transport property is required.');
  }
  require('babel-register')({ only: config.perk.paths.emails });
  const transporter = nodemailer.createTransport(config.email.transport);
  const templateFiles = await listDir(config.perk.paths.emails);
  const emails = templateFiles.filter(f => !path.basename(f).startsWith('_') && f.endsWith('.js'));
  const templates = emails.map((file) => {
    const descriptor = _.trimEnd(
      _.trim(file.substr(config.perk.paths.emails.length), path.sep),
      '.js'
    );
    const component = require(file);
    if(!component.subject) {
      throw new Error(`Email "${descriptor}" is missing a subject`);
    }
    if(typeof component.subject !== 'string') {
      throw new Error(`Email "${descriptor}" has a non-string subject`);
    }
    if(!component.text) {
      throw new Error(`Email "${descriptor}" is missing a text value`);
    }
    if(typeof component.text !== 'string') {
      throw new Error(`Email "${descriptor}" has a non-string text value`);
    }
    if(!component.from) {
      throw new Error(`Email "${descriptor}" is missing a from value`);
    }
    if(!validator.isEmail(component.from, { allow_display_name: true })) {
      throw new Error(`Email "${descriptor}" has an invalid from value`);
    }
    if(!component.description) {
      throw new Error(`Email "${descriptor}" is missing a description value`);
    }
    if(typeof component.description !== 'string') {
      throw new Error(`Email "${descriptor}" has a non-string description value`);
    }
    return {
      descriptor,
      component,
      subject: _.template(component.subject, { interpolate: /{([\s\S]+?)}/g }),
      text: _.template(component.text, { interpolate: /{([\s\S]+?)}/g }),
      description: _.template(component.description, { interpolate: /{([\s\S]+?)}/g }),
      from: component.from
    };
  });

  const baseCss = await fs.readFile(
    path.join(
      __dirname, '..', '..', 'node_modules', 'foundation-emails', 'dist', 'foundation-emails.css'
    )
  );

  return async function email(to, descriptor, params = {}) {
    if(!to) {
      throw new Error('Missing "to" email address.');
    }
    if(!validator.isEmail(to, { allow_display_name: true })) {
      throw new Error('Invalid "to" email address.');
    }
    if(!descriptor) {
      throw new Error('Missing email template descriptor');
    }
    const template = templates.find(t => t.descriptor === descriptor);
    if(!template) {
      throw new Error(`Could not find template with descriptor "${descriptor}".`);
    }
    const subject = template.subject(params);
    const text = template.text(params);
    const description = template.description(params);

    // Generate a html string from the root Inky react component
    const htmlComponent = (
      React.createElement(Inky, null, [
        React.createElement(Inky.Head, { key: 'head' },
          React.createElement('title', null, subject),
          React.createElement('style', { dangerouslySetInnerHTML: {
            __html: baseCss
          }})
        ),
        React.createElement(Inky.Body, { key: 'body', preview: description },
          React.createElement(template.component, params)
        )
      ])
    );

    // Add the doctype
    const htmlContent = Inky.doctype + '\n' + renderToString(htmlComponent);

    // Inline the CSS
    const html = await inlineCss(htmlContent, { url: ' ', preserveMediaQueries: true });

    // Send email
    const input = {
      from: template.from,
      to,
      subject,
      text,
      html
    };
    const output = await transporter.sendMail(input);
    return { input, output };
  }
};
module.exports.requires = [ 'config' ];
