from flask import Flask, request, session
import logging
from Auth.jwtAuth import useJWT, tokenGen
from Lib.flask_pydantic import validate
from Auth.RSA import rsaDecoder
from pydantic import BaseModel
import json
# flask app that serve page index.html
from App.app import app
# app = Flask(__name__, static_url_path='', static_folder='./')

# 日志记录
logger = logging.getLogger('app')

# flask serve the page
# @app.route('/')
# def index():
#     return 'Hello World!'
    # return app.send_static_file('index.html')

class GetModel(BaseModel):
    name: str
    hash:str

class PostModel(BaseModel):
    name: str
    hash:str

class TokenModel(BaseModel):
    uuid:str


# session信息需要加密保存，指定session信息密钥
with open('config.json', 'r') as f:
    config = json.load(f)
    key = config['session']['secret']
    app.config['SECRET_KEY'] = key

@app.get('/api/genToken')
@validate()
def genToken(query:TokenModel):
    session['id'] = query.uuid
    session['authorized'] = True
    return {'token': tokenGen(query.uuid)}

@app.get('/api/get')
@useJWT
@validate()
def get(query: GetModel):
    logger.debug('/api/get query: ', query)
    return {'name': query.name}

@app.post('/api/post')
@useJWT
@rsaDecoder
@validate()
def post(body: PostModel):
    logger.debug('/api/post body: ', str(body))
    return {'name': body.name}

@app.get('/api/delToken')
@validate()
def delToken():
    session['authorized'] = False
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8001, debug=True)
