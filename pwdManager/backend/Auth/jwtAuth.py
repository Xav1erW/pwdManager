from typing import Callable
import jwt
import json
import datetime
from flask import request
import logging
from Auth.SessionPool import SessionPool
from functools import wraps
with open('config.json', 'r') as f:
    config = json.load(f)

SECRET_KEY = config['jwt']['secret_key']

logger = logging.getLogger('Auth')

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
def tokenCheck(pool:SessionPool):
    def jwtAuth(func:Callable, )->Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            token = request.headers.get('Authorization')
            logger.debug('token: ', token)
            if token is None:
                print('token is None')
                return 'no token', 401
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                session = payload['jti']
                if not pool.find(session):
                    return 'session not authorized', 401
            except jwt.ExpiredSignatureError:
                return 'token expired', 401
            except jwt.InvalidTokenError:
                return 'invalid token', 401
            ret = func(*args, **kwargs)
            return ret
        return wrapper
    return jwtAuth