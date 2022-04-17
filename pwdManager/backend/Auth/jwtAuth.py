import jwt
import json
import datetime
from flask import request
from Auth.SessionPool import SessionPool
with open('config.json', 'r') as f:
    config = json.load(f)

SECRET_KEY = config['jwt']['secret_key']

def tokenGen(sessionId:str):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30),
        'iat': datetime.datetime.utcnow(),
        'iss': 'pwdManager',
        'nbf': datetime.datetime.utcnow(),
        'jti': sessionId
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

# a decorator to check the token from the flask request
def jwtAuth(func, pool:SessionPool):
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token is None:
            return {'code': 401, 'msg': 'no token'}
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            session = payload['jti']
            if not pool.find(session):
                return {'code': 401, 'msg': 'session not authorized'}
        except jwt.ExpiredSignatureError:
            return {'code': 401, 'msg': 'token expired'}
        except jwt.InvalidTokenError:
            return {'code': 401, 'msg': 'invalid token'}
        return func(*args, **kwargs)
    return wrapper