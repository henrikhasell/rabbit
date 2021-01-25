import bunny_image from './bunny.png';
import {Button, Col, Image, Jumbotron, Row} from 'react-bootstrap';

const Header: React.FC = () => (
  <header>
    <Jumbotron>
      <Row>
        <Col className="flex-grow-0">
          <Image src={bunny_image}/>
        </Col>
        <Col>
          <h1>The Rabbit has been updated.</h1>
          <p>Re-written from scratch, with performace in mind, the rabbit has been rebuilt.</p>
          <Button size="sm" variant="secondary">View Source Code on GitHub</Button>
        </Col>
      </Row>
    </Jumbotron>
  </header>
);

export default Header;
