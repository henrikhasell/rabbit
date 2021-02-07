import { Container } from "react-bootstrap";

function About(): JSX.Element {
  return (
    <Container>
      <h1>About This Site</h1>
      <div>
        <p>
          <strong>Down the Rabbit-Hole</strong> is an on-going computing art
          project initiated by artist, <strong>Wei Zhou</strong> and software
          developer, <strong>Henrik Hasell</strong>, initially launched at the
          beginning of 2020. It consists an AI text generator and a continually
          updating news-database, which analyses categories of online news from
          politics and technology, to health and food.
        </p>
        <p>
          This project aims to challenge the crooked ground of media dissemination in
          the news production industry. The synchronization between the world events and
          the immediateness of news production. The typically fragmental reading of a
          newspaper can barely hold the gravity of truth in this era of political control
          and information manipulation.
        </p>
        <p>
          The randomly selected words from daily news stirs
          the mixture of reliability and authority of media bodies, stretches the
          information wrap that is built around our perception and discernibility. The
          absurdity and alienation of the generated text confronts the century's challenge
          of the information flow, post-truth and the leaking boat of social trust to media
          institutions, facing the crisis of the tilted objectivity and morality of
          contemporary journalism.  
        </p>
        <p>
          The, sometime tragic, sometime comical sense appear among the generated text which
          mostly makes little sense, but shivers the way how people experience daily information,
          releases an echo in current phenomenon.
        </p>
      </div>
    </Container>
  );
}

export default About;