import React, { Fragment, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

interface Poem {
  date_generated: string;
  paragraphs: string[];
  title: string;
}

interface PoemCardProps {
  poem?: Poem;
  title: string;
}

async function fetchPoem(scope: 'day'|'month'|'year'): Promise<Poem> {
  const result: Response = await fetch(`/api/poem?scope=${scope}`);
  return await result.json();
}

const PoemCard: React.FC<PoemCardProps> = (props: PoemCardProps) => (
  <Col className="mb-4" lg={4}>
    <Card>
      <Card.Body>
        <Card.Title>
          {props.title}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Generated on 2021/01/01
        </Card.Subtitle>
        {props.poem ? props.poem.paragraphs.map(paragraph =>
          <Fragment>{paragraph}<br/></Fragment>
        ) : 'Loading...'}
      </Card.Body>
      <Card.Footer className="text-right">
        <Button className="ml-1" size="sm" variant="secondary">Permalink</Button>
        <Button className="ml-1" size="sm" variant="success">New</Button>
      </Card.Footer>
    </Card>
  </Col>
);

const PoemDisplay: React.FC = () => {
  const [dayPoem, setDayPoem] = useState<Poem|null>(null);
  fetchPoem('month').then(poem => setDayPoem(poem)); 

  return (
    <Container fluid>
      <Row>
        <PoemCard title="Poem of the Day" poem={dayPoem || undefined}/>
        <PoemCard title="Poem of the Month"/>
        <PoemCard title="Poem of the Year"/>
      </Row>
    </Container>
  );
};

export default PoemDisplay;
