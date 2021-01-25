import json
import os
from datetime import datetime
from enum import Enum
from typing import List, Optional

from redis import Redis


class PoemType(Enum):
    Day = 'day'
    Month = 'month'
    Year = 'year'


class Poem:
    def __init__(
        self: object,
        paragraphs: List[str],
        date_generated: datetime
    ):
        self.paragraphs = paragraphs
        self.date_generated = date_generated

    def json(self: object) -> dict:
        return {
            'paragraphs': self.paragraphs,
            'date_generated': self.date_generated.isoformat()
        }

    @staticmethod
    def from_json(json_data: dict):
        return Poem(
            json_data['paragraphs'],
            datetime.fromisoformat(json_data['date_generated'])
        )


class PoemManager:
    def __init__(self: object):
        self.host = os.environ.get('RABBIT_CACHE_HOST')
        self.port = os.environ.get('RABBIT_CACHE_PORT')

        self.max_poems = 100

        self.redis_client = Redis(
            host=self.host,
            port=self.port
        )

    def get_poem(self: object, type: PoemType) -> Optional[Poem]:
        key = f'poem-{type.value}'
        encoded_poem = self.redis_client.rpop(key)

        return encoded_poem and Poem.from_json(json.loads(encoded_poem))
     

    def add_poem(self: object, type: PoemType, poem: Poem) -> None:
        key = f'poem-{type.value}'
        encoded_poem = json.dumps(poem.json())
        self.redis_client.lpush(key, encoded_poem)
        self.redis_client.ltrim(key, 0, self.max_poems)
