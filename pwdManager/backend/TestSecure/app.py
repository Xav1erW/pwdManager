import sys
sys.path.append('..')
import webview
from flask import Flask, request, session
import logging
# from Auth.SessionPool import SessionPool
from Auth.jwtAuth import useJWT, tokenGen
from Lib.flask_pydantic import validate
from Auth.RSA import useRSA
# from Auth.RSADecoder import RSAMiddleware
from pydantic import BaseModel

# flask app that serve page index.html
app = Flask(__name__, static_url_path='', static_folder='./')

logger = logging.getLogger('app')
# logger.setLevel(logging.DEBUG)

# logging.basicConfig(level=logging.DEBUG)
# flask serve the page
@app.route('/')
def index():
    return app.send_static_file('index.html')

class GetModel(BaseModel):
    name: str
    hash:str

class PostModel(BaseModel):
    name: str
    hash:str
    fuck:str

class TokenModel(BaseModel):
    uuid:str

# sessionPool = SessionPool()

app.config['SECRET_KEY'] = 'secret'

@app.get('/api/genToken')
@validate()
def genToken(query:TokenModel):
    session['id'] = query.uuid
    # sessionPool.add(query.uuid)
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
@useRSA(['name', 'hash'])
@validate()
def post(body: PostModel):
    logger.debug('/api/post body: ', str(body))
    # return {'data': str(body)}
    return {"name": body.name, "hash": body.hash}

@app.get('/api/delToken')
@validate()
def delToken():
    session['authorized'] = False
    # sessionPool.remove(query.uuid)
    return {'status': 'ok'}

if __name__ == '__main__':
    window = webview.create_window('Secure', app)
    webview.start(debug=True, gui='edgechromium')
