import moment from 'moment';
import React, { Component, createRef, FC, Fragment, ReactNode } from 'react';
import { Button, Card, Col, Container, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap';
import { OverlayChildren } from 'react-bootstrap/esm/Overlay';
import Permalink from './Permalink';

type PoemScope = 'day' | 'month' | 'year';

export type PoemResponse = {
  date_generated: string;
  hash: string;
  paragraphs: string[];
} | null;

export interface ErrorResponse {
  error_message: string;
}

interface PoemCardProps {
  scope: PoemScope;
}

interface PoemCardState {
  loading: boolean;
  response: PoemResponse|ErrorResponse|undefined;
}

async function fetchPoem(scope: PoemScope): Promise<PoemResponse> {
  const result: Response = await fetch(`/api/poem?scope=${scope}`);
  return await result.json();
}

class PoemCard extends Component<PoemCardProps, PoemCardState> {
  public state: Readonly<PoemCardState> = {
    loading: true,
    response: undefined
  };

  protected overlayReference = createRef();

  public async componentDidMount(): Promise<void> {
    this.getNewPoem();
  }

  static Subtitle: FC<PoemCardState> = (props: PoemCardState) => {
    const {response} = props;

    if (!response || !('date_generated' in response)) {
      return null;
    }

    const {date_generated} = response;

    const overlayTooltip: OverlayChildren = (props) => (
      <Tooltip id="overlay-tooltip" {...props}>
        {moment(date_generated).local().toLocaleString()}
      </Tooltip>
    );

    return (
      <OverlayTrigger overlay={overlayTooltip} placement="bottom">
        <Card.Subtitle className="d-inline pb-0 mt-2 text-muted">
          Generated {moment(date_generated).fromNow()}.
        </Card.Subtitle>
      </OverlayTrigger>
    );
  }

  static Content: FC<PoemCardState> = (props: PoemCardState) => {
    if (props.response === null) {
      return <p>There are currently no poems available.</p>;
    }
    if (props.response === undefined) {
      return <p>Loading...</p>;
    }
    if ('error_message' in props.response) {
      return <p>{props.response.error_message}</p>;
    }
    return (
      <Fragment>
        {props.response.paragraphs.map((value, index) => <p key={index}>{value}</p>)}
      </Fragment>
    );
  };

  public getNewPoem: () => Promise<void> = async () => {
    this.setState({loading: true});

    try {
      const poem: PoemResponse | null = await fetchPoem(this.props.scope);

      this.setState({
        loading: false,
        response: poem
      });
    }
    catch(error) {
      const error_response: ErrorResponse = {
        error_message: `${error}`
      };

      this.setState({
        loading: false,
        response: error_response
      });
    }
  }

  public render(): ReactNode {
    return (
      <Card className={'rabbit-poem-display' + (this.state.loading ? ' loading' : '')}>
        <Card.Header>
          <Card.Title className="mb-0">
            Poem of the {this.props.scope.replace(/^\w/, i => i.toUpperCase())}
          </Card.Title>
          <PoemCard.Subtitle {...this.state}/>
        </Card.Header>
        <Card.Body>
          <PoemCard.Content {...this.state}/>
        </Card.Body>
        <Card.Footer className="align-items-center d-flex flex-row-reverse px-3">
          <Button disabled={this.state.loading} className="ml-1" size="sm" onClick={this.getNewPoem} variant="success">
            New
            {this.state.loading ? <Spinner animation="border" className="ml-1" size="sm"/> : null}
          </Button>
          <Permalink response={this.state.response}/>
        </Card.Footer>
      </Card>
    );
  }
}

const PoemDisplay: FC = () => (
  <Container fluid>
    <Row>
      <Col className="mb-4" lg={4}>
        <PoemCard scope="day"/>
      </Col>
      <Col className="mb-4" lg={4}>
        <PoemCard scope="month"/>
      </Col>
      <Col className="mb-4" lg={4}>
        <PoemCard scope="year"/>
      </Col>
    </Row>
  </Container>
);

export default PoemDisplay;
