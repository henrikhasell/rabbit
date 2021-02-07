import { Button, InputGroup, Overlay, Spinner, Tooltip } from 'react-bootstrap';
import { Component, FC, ReactNode, useEffect, useRef, useState } from 'react';
import { ErrorResponse, PoemResponse } from './PoemDisplay';
import { Link } from 'react-router-dom';

interface PermalinkProps {
  response?: ErrorResponse | PoemResponse | null;
}

interface PermalinkState {
  loading: boolean;
  permalink_url?: string;
}

interface PermalinkResponse {
  permalink: string;
}

async function savePoem(poem: NonNullable<PoemResponse>): Promise<PermalinkResponse> {
  const response: Response = await fetch(`/api/saved_poem/${encodeURIComponent(poem.hash)}`, {
    body: JSON.stringify(poem),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  });

  return response.json();
}

const hash_regex = /([^/]+)$/;

const PermalinkDisplay: FC<{children: string}> = (props) => {
  const match = props.children.match(hash_regex);
  const hash = match ? match[1] : props.children;

  const [show, setShow] = useState<boolean>(false);
  const target = useRef<HTMLButtonElement>(null);

  let timeout: NodeJS.Timeout | null = null;

  const copyToClipboard = () => {
    if (!show) {
      navigator.clipboard.writeText(
        `${window.location.origin}/rabbit/saved-poem/${hash}`
      );
      setShow(true);
      timeout = setTimeout(() => {
        setShow(false);
        timeout = null;
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [timeout]);

  return (
    <div>
      <InputGroup className="flex-nowrap" size="sm">
        <InputGroup.Text className="py-0">
          <Link className="text-reset" to={`/saved-poem/${hash}`}>{hash}</Link>
        </InputGroup.Text>
        <InputGroup.Append>
          <Button disabled={show} onClick={copyToClipboard} ref={target} variant="secondary">
            Copy URL
          </Button>
          <Overlay show={show} target={target.current}>
            {(props) => (
              <Tooltip id={`permalink-${hash}-tooltip`} {...props}>
                Copied to clipboard!
              </Tooltip>
            )}
          </Overlay>
        </InputGroup.Append>
      </InputGroup>
    </div>
  );
}

class Permalink extends Component<PermalinkProps, PermalinkState> {
  public state: Readonly<PermalinkState> = {loading: false};

  protected onClick = async() => {
    const {response} = this.props;

    if (!response || 'error_message' in response) {
      return;
    }

    this.setState({loading:true});

    const permalink_response = await savePoem(response);

    this.setState({
      loading:false,
      permalink_url: permalink_response.permalink
    });
  }

  public componentDidUpdate(prevProps: PermalinkProps, prevState: PermalinkState, _snapshot: any) {
    const getHash =
      (i?: ErrorResponse | PoemResponse | null) => (i && !('error_message' in i) && i.hash) || null;

    if (this.state.permalink_url) {
      const prevHash = getHash(prevProps.response);
      const currHash = getHash(this.props.response);
      if (prevHash !== currHash) {
        this.setState({
          permalink_url: undefined
        });
      }
    }
  }

  public render(): ReactNode {
    const {response} = this.props;
    const disabled = !response || 'error_message' in response || this.state.loading;

    if (this.state.permalink_url) {
      return <PermalinkDisplay>{this.state.permalink_url}</PermalinkDisplay>
    }

    return (
      <Button disabled={disabled} onClick={this.onClick} size="sm" variant="secondary">
        Permalink
        {this.state.loading ? <Spinner animation="border" className="ml-1" size="sm"/> : null}
      </Button>
    );
  }
}

export default Permalink;