# author: Xav1erW
# create date: 2022-4-16
# version: 1.0
# description:
#   a decorator to validate the token from the flask request

from typing import Callable
import jwt
import json
import datetime
from flask import request, session
import logging
from functools import wraps
with open('config.json', 'r') as f:
    config = json.load(f)

SECRET_KEY = config['jwt']['secret_key']

logger = logging.getLogger('Auth')

def tokenGen(sessionId:str)->str:
    """
    generate token for the session with id
    :param sessionId: session id
    """
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30),
        'iat': datetime.datetime.utcnow(),
        'iss': 'pwdManager',
        'nbf': datetime.datetime.utcnow(),
        'jti': sessionId
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

# a decorator to check the token from the flask request
def useJWT(func:Callable, )->Callable:
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        dbUUID = request.headers.get('dbUUID')
        logger.debug('token: ', token)
        if token is None:
            print('token is None')
            return {'msg':'no token'}, 401
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            sessionID = payload['jti']
            assert( session['id'] == sessionID )
            if not session['authorized'].get(dbUUID, False):
                return {'msg':'session not authorized'}, 401
        except jwt.ExpiredSignatureError:
            return {'msg':'token expired'}, 401
        except jwt.InvalidTokenError:
            return {'msg':'invalid token'}, 401
        ret = func(*args, **kwargs)
        return ret
    return wrapper