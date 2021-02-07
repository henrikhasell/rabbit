import { CalendarResposne } from './Calendar';
import { FC, ReactNode } from 'react';
import { Card, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface MonthViewProps {
  month: number;
  year: number;
  response?: CalendarResposne;
};
  
const month_list: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
  
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function monthOffset(year: number, month: number): number {
  const day: number = new Date(year, month, 1).getDay();                                 
  return day === 0 ? 6 : day - 1;
}
  
function maxArticlesPerMonth(response: CalendarResposne, month: number): number {
  const pattern: RegExp = /^\d+\/(\d{2})\/\d{2}$/;
  let max: number = Number.MIN_VALUE;

  for(let key of Object.keys(response)) {
    const match = key.match(pattern);

    if (!match || parseInt(match[1]) !== month + 1) {
      continue;
    }

    const value = response[key];

    if (value > max) {
      max = value;
    }
  }

  return max;
}
  
const MonthViewTable: FC<MonthViewProps> = (props) => {
  const {month, year, response} = props;
  const days_in_month: number = daysInMonth(year, month);
  const month_offset: number = monthOffset(year, month);
  const max_articles: number = response ? maxArticlesPerMonth(response, month) : 0;
  const rows: ReactNode[] = [];

  for (let y = 0; y < Math.max(days_in_month / 7, 5); y++) {
    const row_data: ReactNode[] = [];

    for (let x = 0; x < 7; x++) {
      const index: number = y * 7 + x;
      const out_of_range: boolean = index < month_offset || index > days_in_month + month_offset;

      let cell_content: ReactNode;
      let cell_class: string | undefined;

      if (out_of_range) {
        cell_content = null;
        cell_class = 'bg-light';
      }
      else if (!response) {
        cell_content = '-';
        cell_class = undefined;
      }
      else {
        const mm: string = `${month + 1}`.padStart(2, '0');
        const dd: string = `${index - month_offset + 1}`.padStart(2, '0');
        const cell_number: number = response[`${year}/${mm}/${dd}`] || 0;
        cell_content = (
          <Link className="text-reset" to={`/calendar/${year}/${mm}/${dd}`}>
            {cell_number}
          </Link>
        );

        cell_class = `color-${Math.floor((cell_number / max_articles) * 6) + 1}`;
      }

      row_data.push(
        <td className={cell_class} key={x}>{cell_content}</td>
      );
    }

    rows.push(
      <tr key={y}>
        {row_data}
      </tr>
    );
  }

  return (
    <Table className="mb-0 text-center" responsive>
      <thead>
        <tr>
          <th>Mon</th>
          <th>Tue</th>
          <th>Wed</th>
          <th>Thu</th>
          <th>Fri</th>
          <th>Sat</th>
          <th>Sun</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </Table>
  );
};

const MonthView: FC<MonthViewProps> = (props) => (
  <Card className="mb-4 rabbit-month-view">
    <Card.Header className="border-bottom-0">
      <Card.Title className="mb-0">{month_list[props.month]} {props.year}</Card.Title>
    </Card.Header>
    <MonthViewTable {...props}/>
  </Card>
);

export default MonthView;