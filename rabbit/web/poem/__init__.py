import json
import os
from datetime import datetime
from enum import Enum
from hashlib import md5
from typing import List, Optional

from redis import StrictRedis


RABBIT_POEM_SALT = os.environ.get('RABBIT_POEM_SALT', '')


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

    def hash(self: object) -> str:
        return md5((
            json.dumps(self.paragraphs) +
            self.date_generated.isoformat() +
            RABBIT_POEM_SALT
        ).encode()).hexdigest()[:16]

    def json(self: object) -> dict:
        return {
            'paragraphs': self.paragraphs,
            'date_generated': self.date_generated.isoformat(),
            'hash': self.hash()
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

        self.redis_client = StrictRedis(
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
     
    def save_poem(self: object, poem: Poem, provided_hash: str) -> bool:
        if provided_hash != poem.hash():
            print(
                f'Provided hash "{provided_hash}" '
                f'does not match "{poem.hash()}"".'
            )
            return False

        encoded_poem = json.dumps(poem.json())
        self.redis_client.hmset('saved-poems', {provided_hash: encoded_poem})

        return True

    def get_saved_poem(self: object, hash: str) -> Optional[Poem]:
        encoded_poem = self.redis_client.hget('saved-poems', hash)
        return encoded_poem and Poem.from_json(json.loads(encoded_poem))