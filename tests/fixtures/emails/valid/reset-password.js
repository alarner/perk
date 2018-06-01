const React = require('react');
const { Container, Row, Column } = require('react-inky');

const ResetPassword = ({ secret }) => (
  <Container>
    <Row>
      <Column>Hello, {secret}!</Column>
    </Row>
  </Container>
);

ResetPassword.subject = 'This is a subject';
ResetPassword.from = 'Perk Test <test@test.com>';
ResetPassword.text = 'Hello, {secret}!';
ResetPassword.description = 'Hello, {secret}!';

module.exports = ResetPassword;
