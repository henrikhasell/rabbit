from flask import Flask, render_template

from os import environ

from .api import initialise_api
from .storage import initialise_storage


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('RABBIT_DATABASE_URI', 'sqlite:///')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

initialise_api(app)
initialise_storage(app)


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
