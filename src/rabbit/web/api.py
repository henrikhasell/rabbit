import os
from datetime import datetime
from typing import Callable

from flask import abort, Blueprint, Flask, request
from flask_restx import Api, fields, Resource, reqparse
from flask_restx.utils import default_id
from jsonschema import FormatChecker
from werkzeug.exceptions import default_exceptions

from .decorators import plain_text, require_api_key
from .serialise import serialise_model
from .storage import add_or_update_article, get_articles, get_text_blob


api_blueprint = Blueprint('api', __name__)

api = Api(
    api_blueprint,
    doc='/api', 
    description='An API for updating and viewing the rabbit.',
    format_checker=FormatChecker(formats=['date-time']),
    prefix='/api', 
    title='🐰 The Rabbit API',
    validate=True,
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
    default='2021-02-01',
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
        return get_articles(args['from'], args['until'])


@api.route('/text')
class TextResource(Resource):
    @api.expect(time_range)
    @plain_text
    def get(self: object):
        '''Fetch text from articles within a time range.'''
        args = time_range.parse_args(strict=True)
        return get_text_blob(args['from'], args['until'])


def initialise_api(app: Flask) -> None:
    app.register_blueprint(api_blueprint)
