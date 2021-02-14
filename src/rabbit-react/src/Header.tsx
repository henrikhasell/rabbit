import bunny_image from './bunny.png';
import React, { FC } from 'react';
import { Col, Image, Jumbotron, Row } from 'react-bootstrap';

const Header: FC = () => (
  <header>
    <Jumbotron>
      <Row>
        <Col className="flex-grow-0">
          <Image src={bunny_image}/>
        </Col>
        <Col>
          <h1>The Rabbit has been updated.</h1>
          <p>Re-written from scratch, with performace in mind, the rabbit has been rebuilt.</p>
        </Col>
      </Row>
    </Jumbotron>
  </header>
);

export default Header;
