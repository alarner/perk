const React = require('react');
const { Container, Row, Column } = require('react-inky');

const Test = ({ name }) => (
  <Container>
    <Row>
      <Column>Hello, {name}!</Column>
    </Row>
  </Container>
);

module.exports = Test;
