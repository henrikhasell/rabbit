import json
import os
from datetime import datetime, timedelta, timezone
from time import sleep
from typing import Dict

import markovify
import requests 
from requests.exceptions import HTTPError

from .logger import logger
from .web.poem import Poem, PoemType


class Scope:
    def __init__(self: object, fr: datetime, un: datetime):
        self.fr = fr
        self.un = un


format_date = lambda i: i.strftime('%Y-%m-%d')


def build_poems(scope_map: Dict[PoemType, Scope], poem_type: PoemType):
    scope = scope_map[poem_type]
    
    logger.info(f'Fetching text blob for "{poem_type.value}" scope.')
    
    response = requests.get(rabbit_text_endpoint, params={
        'from': format_date(scope.fr),
        'until': format_date(scope.un)
    }, timeout=15)
    
    try:
        response.raise_for_status()
    except HTTPError as e:
        logger.warning(e)
        return
    
    if not response.text:
        logger.warning(f'Text blob empty for "{poem_type.value}", skipping.')
        return
    
    logger.info(f'Generating markov chain with "{poem_type.value}" scope.')
    
    text_model = markovify.Text(response.text)
    
    for i in range(10):
        poem = Poem(
            [text_model.make_sentence() for _ in range(5)],
            datetime.utcnow().replace(tzinfo=timezone.utc)
        )
        logger.debug(json.dumps(poem.json(), indent=2))
    
        response = requests.post(rabbit_poem_endpoint, json=poem.json(),
            headers={
                'X-Api-Key': rabbit_api_key
            },
            params={
                'scope': poem_type.value
            },
            timeout=15
        )
    
        try:
            response.raise_for_status()
        except HTTPError as e:
            logger.warning(e)


if __name__ == '__main__':
    rabbit_api_key = os.environ['RABBIT_API_KEY']
    rabbit_poem_endpoint = os.environ['RABBIT_POEM_ENDPOINT']
    rabbit_text_endpoint = os.environ['RABBIT_TEXT_ENDPOINT']

    while True:
        current_time = datetime.utcnow()
    
        scope_map = {
            PoemType.Day: Scope(
                current_time - timedelta(days=1),
                current_time
            ),
            PoemType.Month: Scope(
                current_time - timedelta(days=30),
                current_time
            ),
            PoemType.Year: Scope(
                current_time - timedelta(days=365),
                current_time
            )
        }
    
        for poem_type in PoemType:
            build_poems(scope_map, poem_type)

        sleep(60 * 60)
