from datetime import datetime
from typing import List

from flask_sqlalchemy import Model


def is_valid_attribute(attr: str) -> bool:
    return attr not in {'metadata', 'query', 'query_class'} and not attr.startswith('_')


def model_attributes(model: Model) -> List[str]:
    return list(filter(is_valid_attribute, dir(model)))


def serialise_attribute(attr: object) -> object:
    if isinstance(attr, datetime):
        return attr.isoformat()
    if isinstance(attr, Model):
        return str(attr)
    return attr


def serialise_model(model: Model) -> dict:
    attributes = {i: getattr(model, i) for i in model_attributes(model)}
    return {k: serialise_attribute(v) for k, v in attributes.items()}