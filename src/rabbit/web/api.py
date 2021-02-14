import os
from datetime import datetime
from typing import Callable

from flask import abort, Blueprint, Flask, request
from flask_restx import Api, fields, Resource, reqparse
from jsonschema import FormatChecker
from werkzeug.exceptions import default_exceptions

from .decorators import require_poem_scope, plain_text, require_api_key
from .poem import Poem, PoemManager, PoemType
from .serialise import serialise_model
from .storage import add_or_update_article, get_articles, get_text_blob, \
    articles_by_date_published


api_blueprint = Blueprint('api', __name__)

api = Api(
    api_blueprint,
    doc='/api', 
    description='An API for updating and viewing the rabbit.',
    
    prefix='/api', 
    title='🐰 The Rabbit API',
    version='0.1'
)

article_model = api.model('Article', {
    'url': fields.String(
        example='https://www.bbc.co.uk/news/example-12345678',
        required=True
    ),
    'title': fields.String(
        example='An Example Article',
        required=True
    ),
    'category': fields.String(
        example='UK',
        required=True
    ),
    'paragraphs': fields.List(
        fields.String,
        example=['First paragraph.', 'Second paragraph.'],
        required=True
    ),
    'date_published': fields.DateTime(
        example='2020-12-22T11:26:05.594814+00:00',
        required=True
    )
})

poem_model = api.model('Poem', {
    'paragraphs': fields.List(
        fields.String,
        example=['First paragraph.', 'Second paragraph.'],
        required=True
    ),
    'date_generated': fields.DateTime(
        dt_format='iso8601',
        example='2020-12-22T11:26:05.594814+00:00',
        required=True
    )
})

poem_with_hash_model = api.inherit('Poem With Hash', poem_model, {
    'hash': fields.String(
        example='1fe6ec3ce370e8d710a061afde3eee1d',
        required=True
    )
})

time_range = reqparse.RequestParser()

time_range.add_argument(
    'from',
    default='2020-01-01',
    help='An ISO 8601 formatted date.',
    required=True,
    type=datetime.fromisoformat,
    location='args'
)

time_range.add_argument(
    'until',
    default='2020-02-01',
    help='An ISO 8601 formatted date.',
    required=True,
    type=datetime.fromisoformat,
    location='args'
)


def require_rabbit_api_key(func: Callable) -> Callable:
    api_key = os.environ.get('RABBIT_API_KEY', '')
    return require_api_key(api, api_key)(func)


@api.route('/article')
class ArticleResource(Resource):
    @api.expect(article_model)
    @require_rabbit_api_key
    @plain_text
    def post(self: object):
        '''Add or update an article.'''
        return_code = add_or_update_article(
            request.json['url'],
            request.json['title'],
            request.json['category'],
            datetime.fromisoformat(request.json['date_published']),
            request.json['paragraphs']
        )

        return '', return_code

    @api.expect(time_range)
    @api.marshal_with(article_model, as_list=True)
    def get(self: object):
        '''Fetch articles within a time range.'''
        args = time_range.parse_args(strict=True)

        return list(map(
            lambda i: i.json(),
            get_articles(args['from'], args['until'])
        ))


@api.route('/text')
class TextResource(Resource):
    @api.expect(time_range)
    @plain_text
    def get(self: object):
        '''Fetch text from articles within a time range.'''
        args = time_range.parse_args(strict=True)
        return get_text_blob(args['from'], args['until'])


@api.route('/calendar/<int:year>')
class CalendarResource(Resource):
    def get(self: object, year: int):
        return articles_by_date_published(year)


@api.route('/poem')
class PoemResource(Resource):
    @require_poem_scope(api)
    def get(self: object):
        scope = PoemType(request.args['scope'])
        poem_manager = PoemManager()
        poem = poem_manager.get_poem(scope)
        return (poem.json(), 200) if poem else (None, 404)

    @api.expect(poem_with_hash_model)
    @require_poem_scope(api)
    @require_rabbit_api_key
    def post(self: object):
        scope = PoemType(request.args['scope'])
        poem = Poem.from_json(request.json)
        poem_manager = PoemManager()
        return poem_manager.add_poem(scope, poem), 200


@api.route('/saved_poem/<hash>')
class SavedPoemResource(Resource):
    @api.marshal_with(poem_model)
    def get(self: object, hash: str):
        poem_manager = PoemManager()
        poem = poem_manager.get_saved_poem(hash)
        return (poem.json(), 200) if poem else (None, 404)

    @api.expect(poem_model)
    def post(self: object, hash: str):
        poem = Poem.from_json(request.json)
        poem_manager = PoemManager()
        success = poem_manager.save_poem(poem, hash)

        if not success:
            abort(401)

        return {'permalink': f'{request.url_root}saved_poem/{poem.hash()}'}


def initialise_api(app: Flask) -> None:
    app.register_blueprint(api_blueprint)
