from functools import wraps
from typing import Callable

from flask import abort, request
from flask.helpers import make_response
from flask_restx import Api

from .poem import PoemType


def require_poem_scope(api: Api) -> Callable:
    def decorator(func: Callable) -> Callable:
        decorated_func = api.param(
            'scope',
            'The scope of the poem.',
            enum=[i.value for i in PoemType],
            required=True
        )(func)
        @wraps(decorated_func)
        def wrapper(*args, **kwargs) -> Callable:
            return decorated_func(*args, **kwargs)
        return wrapper
    return decorator


def require_api_key(api: Api, api_key: str) -> Callable:
    def decorator(func: Callable) -> Callable:
        decorated_func = api.param(
            'X-Api-Key',
            'This action requires an API key.',
            'header',
            required=True
        )(func)
        @wraps(decorated_func)
        def wrapper(*args, **kwargs):
            if request.headers.get('X-Api-Key') != api_key:
                abort(403)
            return decorated_func(*args, **kwargs)
        return wrapper
    return decorator


def plain_text(func: Callable) -> Callable:
    @wraps(func)
    def wrapper(*args, **kwargs) -> Callable:
        result = func(*args, **kwargs)
        response = make_response(result)
        response.mimetype = 'text/plain'
        return response
    return wrapper