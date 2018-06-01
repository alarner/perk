const React = require('react');
const { Container, Row, Column } = require('react-inky');

const ResetPasswordNotification = ({ name }) => (
  <Container>
    <Row>
      <Column>Hello, {secret}!</Column>
    </Row>
  </Container>
);

ResetPasswordNotification.subject = 'This is a subject';
ResetPasswordNotification.from = 'Perk Test <test@test.com>';
ResetPasswordNotification.text = 'Hello, {secret}!';
ResetPasswordNotification.description = 'Hello, {secret}!';

module.exports = ResetPasswordNotification;
