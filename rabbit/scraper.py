from email.utils import parsedate_to_datetime
from typing import List, Optional
from urllib.parse import ParseResult, urlparse

import bs4
import requests
from datetime import datetime, timezone
from retry import retry

from .logger import logger
from .utilities import is_news_article


class ScraperError(Exception):
    pass


class Scraper:
    date_formats = [
        r'%Y-%m-%dT%H:%M:%S.%fZ',
        r'%Y-%m-%dT%H:%M:%S+%f',
        r'%Y-%m-%dT%H:%M:%SZ'
    ]

    @staticmethod
    def format_url(url: str) -> ParseResult:
        url_parse = urlparse(url)

        if url_parse.scheme == 'http':
            scheme = 'https'
        else:
            scheme = url_parse.scheme

        if url_parse.hostname == 'www.bbc.com':
            hostname = 'www.bbc.co.uk'
        else:
            hostname = url_parse.hostname

        if url_parse.path.endswith('/'):
            path = url_parse.path[:-1]
        else:
            path = url_parse.path

        return urlparse(f'{scheme}://{hostname}{path}')

    @staticmethod
    @retry(exceptions=requests.RequestException, tries=10, delay=1, backoff=2)
    def fetch(url: str) -> requests.Response:
        return requests.get(url, timeout=5)

    def __init__(self: object, url: str):
        result = Scraper.fetch(url)
        result.encoding = 'utf-8'

        self.soup = bs4.BeautifulSoup(result.text, 'html.parser')
        self.url = Scraper.format_url(url)

    def _format_href(self: object, href: str) -> str:
        if href.startswith('/'):
            href = f'{self.url.scheme}://{self.url.hostname}{href}'
    
        url = Scraper.format_url(href)

        return f'{url.scheme}://{url.hostname}{url.path}'

    def get_title(self: object) -> str:
        header_element = self.soup.h1

        if not header_element:
            raise ScraperError('Header missing from page.')

        return header_element.text


    def get_date(self: object) -> datetime:
        date_element = self.soup.find('time', {'datetime': True})

        if not date_element:
            raise ScraperError(f'Date missing from page.')

        date_string = date_element['datetime']

        for date_format in self.date_formats:
            try:
                return datetime.strptime(date_string, date_format)\
                    .replace(tzinfo=timezone.utc)
            except ValueError:
                pass

        try:
            # RFC-822
            return parsedate_to_datetime(date_string)
        except TypeError:
            pass
        try:
            # ISO-8601
            return datetime.fromisoformat(date_string)
        except ValueError:
            pass

        raise ScraperError(f'Unrecognized date format "{date_string}".')

    def get_links(self: object) -> List[str]:
        href_elements = self.soup.find_all('a', {'href': True})
        return list(map(lambda i: self._format_href(i['href']), href_elements))

    def get_related(self: object) -> List[str]:
        related_news = lambda i: is_news_article(i) and \
            urlparse(i).hostname == self.url.hostname 

        return list(filter(related_news, self.get_links()))

    def get_content(self: object) -> List[str]:
        if not self.soup.article:
            return []

        paragraphs = self.soup.article.find_all('div', {
            'data-component': 'text-block'
        })

        return [i.text for i in paragraphs]

    def get_category(self: object) -> str:
        meta_tag = self.soup.find('meta', {'property': 'article:section'})

        if not meta_tag:
            raise ScraperError('Meta tag missing from page.')

        return meta_tag.attrs['content']
