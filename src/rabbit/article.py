from datetime import datetime
from typing import List

from .scraper import Scraper


class Article:
    @staticmethod
    def from_scraper(scraper: Scraper):
        url = scraper.url

        return Article(
            f'{url.scheme}://{url.hostname}{url.path}',
            scraper.get_title(),
            scraper.get_date(),
            scraper.get_content(),
            scraper.get_related(),
            scraper.get_category()
        )

    def __init__(
        self: object,
        url: str,
        title: str,
        date: datetime,
        content: List[str],
        related: List[str],
        category: str
    ):
        self.url = url
        self.title = title
        self.date = date
        self.content = content
        self.related = related
        self.category = category

    def json(self: object) -> dict:
        return {
            'url': self.url,
            'title': self.title,
            'date_published': self.date.isoformat(),
            'category': self.category,
            'paragraphs': self.content
        }