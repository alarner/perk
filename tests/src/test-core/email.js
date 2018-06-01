const path = require('path');

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const transport = require('nodemailer-stub-transport')();

const createEmail = require('../../../src/core/email');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('core/email', function() {
  describe('createEmail', function() {
    it('should throw the appropriate validation errors', async function() {
      await expect(
        createEmail({
          config: {
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/subject-missing')} }
          }
        }),
        'config.email'
      ).to.be.rejectedWith('email configuration is required.');
      await expect(
        createEmail({
          config: {
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/subject-missing')} },
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
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/subject-missing')} },
            email: {
              transport: {},
              templateEngine: 'ejs'
            }
          }
        }),
        'missing subject'
      ).to.be.rejectedWith('Email "test" is missing a subject');
      await expect(
        createEmail({
          config: {
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/subject-invalid')} },
            email: {
              transport: {},
              templateEngine: 'ejs'
            }
          }
        }),
        'invalid subject'
      ).to.be.rejectedWith('Email "test" has a non-string subject');
      await expect(
        createEmail({
          config: {
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/text-missing')} },
            email: {
              transport: {},
              templateEngine: 'ejs'
            }
          }
        }),
        'missing text'
      ).to.be.rejectedWith('Email "test" is missing a text value');
      await expect(
        createEmail({
          config: {
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/text-invalid')} },
            email: {
              transport: {},
              templateEngine: 'ejs'
            }
          }
        }),
        'invalid text'
      ).to.be.rejectedWith('Email "test" has a non-string text');
      await expect(
        createEmail({
          config: {
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/from-missing')} },
            email: {
              transport: {},
              templateEngine: 'ejs'
            }
          }
        }),
        'missing from'
      ).to.be.rejectedWith('Email "test" is missing a from value');
      await expect(
        createEmail({
          config: {
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/from-invalid')} },
            email: {
              transport: {},
              templateEngine: 'ejs'
            }
          }
        }),
        'invalid from'
      ).to.be.rejectedWith('Email "test" has an invalid from value');
      await expect(
        createEmail({
          config: {
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/description-missing')} },
            email: {
              transport: {},
              templateEngine: 'ejs'
            }
          }
        }),
        'missing description'
      ).to.be.rejectedWith('Email "test" is missing a description value');
      await expect(
        createEmail({
          config: {
            perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/description-invalid')} },
            email: {
              transport: {},
              templateEngine: 'ejs'
            }
          }
        }),
        'invalid description'
      ).to.be.rejectedWith('Email "test" has a non-string description');
    });
    it('should create the emailer if everything is valid', async function() {
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
  describe('email', function() {
    it('should throw the appropriate validation errors', async function() {
      const email = await createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/valid')} },
          email: {
            transport: {},
            templateEngine: 'ejs'
          }
        }
      });
      await expect(email(), 'missing email').to.be.rejectedWith('Missing "to" email address.');
      await expect(email('asdf'), 'invalid email').to.be.rejectedWith('Invalid "to" email address.');
      await expect(email('test@test.com'), 'missing descriptor').to.be.rejectedWith(
        'Missing email template descriptor'
      );
      await expect(email('test@test.com', 'skjdfh'), 'template not found').to.be.rejectedWith(
        'Could not find template with descriptor "skjdfh".'
      );
    });
    it('should send an email if everything is valid', async function() {
      const email = await createEmail({
        config: {
          perk: { paths: { emails: path.join(__dirname, '../../fixtures/emails/valid')} },
          email: {
            transport,
            templateEngine: 'ejs'
          }
        }
      });
      const result = await email('to@test.com', 'reset-password', { secret: 'a secret' });
      expect(result.output.envelope).to.deep.equal({
        from: 'test@test.com',
        to: [ 'to@test.com' ]
      });
    });
  });
});
