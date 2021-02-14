import { Col, Container, Row } from 'react-bootstrap';
import React, { Component, ReactNode } from 'react';
import MonthView from './MonthView';

export interface CalendarResposne {
  [date: string]: number
};

interface CalendarState {
  response: CalendarResposne|{error_message: string}|undefined;
}

export function fetchCalendar(year: number, abort_signal: AbortSignal): Promise<CalendarResposne> {
  return fetch(`/api/calendar/${year}`, {signal: abort_signal}).then(i => i.json());
}

class Calendar extends Component<{year: number}, CalendarState> {
  public state: Readonly<CalendarState> ={response: undefined};

  protected abort_controller: AbortController = new AbortController();

  public async componentDidMount(): Promise<void> {
    try {
      const response: CalendarResposne = await fetchCalendar(
        this.props.year,
        this.abort_controller.signal
      );
      this.setState({response: response});
    } catch(error) {
      this.setState({response: {
        error_message: `${error}`
      }})
    }
  }

  public componentWillUnmount(): void {
    this.abort_controller.abort();
  }

  public render(): ReactNode {
    const { response } = this.state;

    if (response && 'error_message' in response) {
      return (
        <Container fluid>
          <p>{response.error_message}</p>
        </Container>
      );
    }

    const row_elements: ReactNode[] = [];

    for (let month = 0; month < 12; month++) {
      row_elements.push(
        <Col key={month} md={6}>
          <MonthView month={month} year={this.props.year} response={response}/>
        </Col>
      );
    }

    return (
      <Container fluid>
        <Row>
          {row_elements}
        </Row>
      </Container>
    );
  }
}

export default Calendar;