from collections import namedtuple
from concurrent.futures import as_completed, ThreadPoolExecutor
from os import environ
from typing import Generator, List

import requests
from requests.api import head

from .article import Article
from .logger import logger
from .scraper import Scraper, ScraperError


QueueItem = namedtuple('QueueItem', ['url', 'depth'])


class Crawler:
    def __init__(self: object, url_list: List[str]):
        self.max_depth = 5
        self.queue = set(QueueItem(i, 0) for i in url_list)
        self.visited_sites = set()

    def _append_queue(self: object, url: str, depth: int):
        if url in self.visited_sites:
            return

        self.queue += [QueueItem(url, depth)]
        self.visited_sites.add(url)

    def get_article(self: object, url: str) -> Article:
        return Article.from_scraper(Scraper(url))

    def crawl(self: object) -> Generator[Article, None, None]:
        while len(self.queue) > 0:
            with ThreadPoolExecutor(max_workers=32) as executor:
                mapping = {executor.submit(self.get_article, i.url): i for i in self.queue}
                self.queue = []

                for future in as_completed(mapping):
                    url, depth = mapping[future]

                    try:
                        article = future.result()
                        logger.info(f'✅ {url} ({depth})')
                    except ScraperError as error:
                        logger.info(f'❎ {url} ({depth}) {error}')
                        continue
                    except Exception as error:
                        logger.error(f'⚠️  {url} ({depth})')
                        logger.error(f'An exception occured: {error}')

                    yield article

                    if depth < self.max_depth:
                        for url in article.related:
                            self._append_queue(url, depth + 1)


if __name__ == '__main__':
    while True:
        crawler = Crawler([
            'https://www.bbc.co.uk/news/uk',
            'https://www.bbc.co.uk/news/world',
            'https://www.bbc.co.uk/news/business',
            'https://www.bbc.co.uk/news/politics',
            'https://www.bbc.co.uk/news/technology',
            'https://www.bbc.co.uk/news/science_and_environment',
            'https://www.bbc.co.uk/news/health',
            'https://www.bbc.co.uk/news/education',
            'https://www.bbc.co.uk/news/entertainment_and_arts'
        ])
        for article in crawler.crawl():
            response = requests.post(
                environ['RABBIT_WEB_URL'],
                headers={'X-Api-Key': 'test'},
                json=article.json()
            )
            response.raise_for_status()