import { Container } from 'react-bootstrap';
import { FC, useEffect, useState } from 'react';

interface SavedPoemProps {
  hash: string;
}

interface SavedPoemResponse {
  paragraphs: string[];
}

const SavedPoem: FC<SavedPoemProps> = (props) => {
  const [poem, setPoem] = useState<SavedPoemResponse | null>(null);

  useEffect(() => {
    const abort_controller: AbortController = new AbortController();

    const fetchSavedPoem = async(hash: string) => {
      const response: Response = await fetch(`/api/saved_poem/${hash}`, {
        signal: abort_controller.signal
      });
      const poem: SavedPoemResponse = await response.json();
      setPoem(poem);
    };

    fetchSavedPoem(props.hash);
    return () => {
      abort_controller.abort();
    };
  }, [props.hash]);

  return (
    <Container>
      Saved poem: {props.hash}
      <hr/>
      {poem && poem.paragraphs.map((i, index) => <p key={index}>{i}</p>)}
    </Container>
  );
};

export default SavedPoem;