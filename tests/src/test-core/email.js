const path = require('path');

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

const createEmail = require('../../../src/core/email');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('core/email', function() {
  it('should throw the appropriate validation errors', async function() {
    await expect(
      createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/broken-html')} }
        }
      }),
      'config.email'
    ).to.be.rejectedWith('email configuration is required.');
    await expect(
      createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/broken-html')} },
          email: {}
        }
      }),
      'config.email.transport'
    ).to.be.rejectedWith(
      'email configuration with a transport property is required.'
    );
    await expect(
      createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/broken-html')} },
          email: {
            transport: {}
          }
        }
      }),
      'config.email.templateEngine'
    ).to.be.rejectedWith('email configuration with a templateEngine property is required.');
    await expect(
      createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/broken-html')} },
          email: {
            transport: {},
            templateEngine: 'ejs'
          }
        }
      }),
      'html file'
    ).to.be.rejectedWith('Email template "test" is missing a HTML template (content.html)');
    await expect(
      createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/broken-txt')} },
          email: {
            transport: {},
            templateEngine: 'ejs'
          }
        }
      }),
      'html file'
    ).to.be.rejectedWith('Email template "test" is missing a text template (content.txt)');
    await expect(
      createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/missing-subject')} },
          email: {
            transport: {},
            templateEngine: 'ejs'
          }
        }
      }),
      'missing subject'
    ).to.be.rejectedWith('Email template "test" is missing a subject (meta.js)');
    await expect(
      createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/missing-from')} },
          email: {
            transport: {},
            templateEngine: 'ejs'
          }
        }
      }),
      'missing from'
    ).to.be.rejectedWith('Email template "test" is missing a from address (meta.js)');
    await expect(
      createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/invalid-from')} },
          email: {
            transport: {},
            templateEngine: 'ejs'
          }
        }
      }),
      'invalid from'
    ).to.be.rejectedWith('Email template "test" has an invalid from address (meta.js)');
  });
  it('should work if everything is valid', async function() {
    const email = await createEmail({
      config: {
        perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/valid')} },
        email: {
          transport: {},
          templateEngine: 'ejs'
        }
      }
    });
    expect(email).to.be.a('function');
  });
});
