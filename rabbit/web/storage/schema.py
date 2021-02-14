from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Paragraph(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False)
    article_url = db.Column(db.String, db.ForeignKey('article.url'))

    def __str__(self: object):
        return f'{self.text}'


class Article(db.Model):
    url = db.Column(db.String, primary_key=True)
    title = db.Column(db.String, nullable=False)
    category = db.Column(db.String, nullable=False)
    date_published = db.Column(db.DateTime, nullable=False)
    paragraphs = db.relationship(
        'Paragraph',
        order_by=Paragraph.id,
        backref='article'
    )