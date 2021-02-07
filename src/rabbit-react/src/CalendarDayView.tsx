import { FC, Fragment, useEffect, useState } from 'react';
import { Card, Container, Spinner, Table } from 'react-bootstrap';
import moment from 'moment';
import MonthView from './MonthView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CalendarResposne, fetchCalendar } from './Calendar';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-regular-svg-icons'

interface CalendarDayViewProps {
  day: number;
  month: number;
  year: number;
}

interface Article {
  url: string;
  title: string;
  category: string;
  paragraphs: string[];
  date_published: string;
}

interface ArticleViewProps extends CalendarDayViewProps {
  articles: Article[] | undefined;

}

const formatDate = (year: number, month: number, day: number) => {
  const mm: string = `${month + 1}`.padStart(2, '0');
  const dd: string = `${day + 1}`.padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const fetchArticles = async(year: number, month: number, day: number, abort_signal: AbortSignal) => {
  const formattedDate = formatDate(year, month, day);
  const fromString = encodeURIComponent(`${formattedDate}T00:00:00`);
  const untilString = encodeURIComponent(`${formattedDate}T23:59:59`);

  const response: Response = await fetch(`/api/article?from=${fromString}&until=${untilString}`, {
    signal: abort_signal
  });
  return await response.json() as Article[];
};

const Time: FC<{children: string}> = (props) => (
  <Fragment>{moment(props.children).format('HH:MM:SS')}</Fragment>
);

const ArticleViewTable: FC<{articles: Article[]}> = (props) => {
  const { articles } = props;
  const [selectedArticle, setSelectedArticle] = useState<string|undefined>(undefined);
  const selectArticle = (url: string) => setSelectedArticle(url === selectedArticle ? undefined : url);

  return (
    <Table responsive size="sm">
      <thead className="bg-light text-nowrap">
        <tr>
          <th className="text-center"  style={{width:'76px'}}>Expand</th>
          <th className="text-center"  style={{width:'136px'}}>Time Published</th>
          <th>Title</th>
        </tr>
      </thead>
      <tbody>
        {articles.map(article => {
          const expanded = selectedArticle === article.url;
          return (
            <Fragment key={article.url}>
              <tr>
                <td className="bg-light text-center" style={{width:'76px'}}>
                  <span className="btn btn-link m-0 p-0 text-reset">
                    <FontAwesomeIcon
                      icon={expanded ? faMinusSquare : faPlusSquare}
                      onClick={() => selectArticle(article.url)}/>
                  </span>
                </td>
                <td className="bg-light border-right text-center" style={{width:'136px'}}>
                  <Time>{article.date_published}</Time>
                </td>
                <td>
                  <a className="text-reset" href={article.url}>{article.title}</a>
                </td>
              </tr>
              {selectedArticle === article.url ? (
                <tr>
                  <td className="bg-light border-right border-top-0" colSpan={2}>
                  </td>
                  <td className="border-0">
                    <Card className="small">
                      <Card.Body className="p-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                        {article.paragraphs.map((value, index) => (
                          <p className="mb-2" key={index}>{value}</p>
                        ))}
                      </Card.Body>
                    </Card>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          );
        })}
      </tbody>
    </Table>
  );
};

const ArticleView: FC<ArticleViewProps> = (props) => {
  const {articles, day, month, year} = props;
  const headerClass = articles && articles.length ? "border-bottom-0" : undefined;
  const formattedDate = formatDate(year, month, day);
  return (
    <Card>
      <Card.Header className={headerClass}>Day View {formattedDate}</Card.Header>
      {articles && articles.length > 0 ? <ArticleViewTable articles={articles}/> : (
        <Card.Body>
          {articles === undefined ? (
            <Fragment>
              Loading...<Spinner animation="border" className="ml-2" size="sm"/>
            </Fragment>
          ) : (
            <Fragment>
              There are no articles for this day.
            </Fragment>
          )}
        </Card.Body>
      )}
    </Card>
  )
}

const CalendarDayView: FC<CalendarDayViewProps> = (props) => {
  const { day, month, year } = props;
  const [articles, setArticles] = useState<Article[]|undefined>(undefined);
  const [calendar, setCalendar] = useState<CalendarResposne|undefined>(undefined);
  useEffect(() => {
    const abort_controller = new AbortController();

    const onMount = async() => {
      try {
        const response = await fetchCalendar(2021, abort_controller.signal);
        setCalendar(response);
      }
      catch (_error: any) {
        // TODO: Display the error.
      }
    };

    onMount();

    return () => abort_controller.abort();
  }, []);

  useEffect(() => {
    const abort_controller = new AbortController();

    const onDayChanged = async() => {
      setArticles(undefined);

      try {
        const articles = await fetchArticles(year, month, day, abort_controller.signal);
        setArticles(articles);
      }
      catch (_error: any) {
        // TODO: Display the error.
      }
    };
    onDayChanged();

    return () => abort_controller.abort();
  }, [day, month, year]);

  return (
    <Container className="pb-4" fluid>
      <MonthView month={month} year={year} response={calendar}/>
      <ArticleView articles={articles} {...props}/>
    </Container>
  );
};

export default CalendarDayView;