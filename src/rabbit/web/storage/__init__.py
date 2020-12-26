from datetime import datetime
from typing import List

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from retry import retry
from sqlalchemy.exc import IntegrityError, OperationalError

from rabbit.web.serialise import serialise_model
from .schema import db, Article, Paragraph


@retry(exceptions=[IntegrityError, OperationalError], delay=1, tries=3)
def initialise_storage(app: Flask) -> None:
    db.init_app(app)
    with app.app_context():
        db.create_all()


def add_or_update_article(
    url: str,
    title: str,
    category: str,
    date_published: datetime,
    paragraphs: List[str]
) -> int:
    article = Article.query.filter_by(url=url).one_or_none()

    if article:
        return_code = 200
    else:
        article = Article()
        return_code = 201

    article.url = url
    article.title = title
    article.category = category
    article.date_published = date_published

    for paragraph in article.paragraphs:
        db.session.delete(paragraph)

    for paragraph in paragraphs:
        db.session.add(Paragraph(text=paragraph, article=article))

    db.session.add(article)
    db.session.commit()

    return return_code

def get_text_blob(min: datetime, max: datetime) -> str:
    results = Paragraph.query.join(Article).filter(
        Article.date_published >= min,
        Article.date_published <= max
    ).with_entities(Paragraph.text).all()
    return '\n'.join(map(lambda i: i[0], results))


def get_articles(min: datetime, max: datetime) -> str:
    results = Article.query.filter(
        Article.date_published >= min,
        Article.date_published <= max
    ).all()
    return list(map(serialise_model, results))
