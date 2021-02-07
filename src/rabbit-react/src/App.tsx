import { BrowserRouter, Route, RouteComponentProps } from 'react-router-dom';
import About from './About';
import Calendar from './Calendar';
import Header from './Header';
import NavigationBar from './NavigationBar';
import PoemDisplay from './PoemDisplay';
import React from 'react';
import SavedPoem from './SavedPoem';
import './style.scss';
import CalendarDayView from './CalendarDayView';

type CalendarRouteProps = RouteComponentProps<{
  year?: string;
}>;

type CalendarDayRouteProps = RouteComponentProps<{
  day: string;
  month: string;
  year: string;
}>;

type SavedPoemRouteProps = RouteComponentProps<{
  hash: string;
}>;

const currentDay = () => new Date().getDay() - 1;

const currentMonth = () => new Date().getMonth();

const currentYear = () => new Date().getFullYear();

const parseDay = (i?: string) => {
  const parsed: number | null = (i && parseInt(i)) || null;

  if (typeof(parsed) === 'number') {
    return parsed - 1;
  }

  return currentDay();
}

const parseMonth = (i?: string) => {
  const parsed: number | null = (i && parseInt(i)) || null;

  if (typeof(parsed) === 'number') {
    return parsed - 1;
  }

  return currentMonth();
}

const parseYear = (i?: string) => (i && parseInt(i)) || currentYear();

function App(): JSX.Element {
  return (
    <div className="App">
        <BrowserRouter basename="/rabbit">
          <NavigationBar/>
          <Header/>
          <Route exact path="/">
            <PoemDisplay/>
          </Route>
          <Route exact path="/calendar/:year?" render={(props: CalendarRouteProps) => {
            const {year} = props.match.params;
            return <Calendar year={parseYear(year)}/>;
          }}/>
          <Route exact path="/calendar/:year/:month/:day" render={(props: CalendarDayRouteProps) => {
            const {day, month, year} = props.match.params;
            return <CalendarDayView day={parseDay(day)} month={parseMonth(month)} year={parseYear(year)}/>;
          }}/>
          <Route exact path="/saved-poem/:hash"render={(props: SavedPoemRouteProps) => {
            const {hash} = props.match.params;
            return <SavedPoem hash={hash}/>;
          }}/>
          <Route exact path="/about">
            <About/>
          </Route>
        </BrowserRouter>
    </div>
  );
}

export default App;
