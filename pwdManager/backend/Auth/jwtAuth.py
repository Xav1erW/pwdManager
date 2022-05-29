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
import sys, os
if getattr(sys, 'frozen', False):
    application_path = os.path.dirname(sys.executable)
elif __file__:
    application_path = os.path.dirname(__file__)
configPath = os.path.join(application_path, 'config.json')
with open(configPath, 'r') as f:
    config = json.load(f)

print(config)
SECRET_KEY = config['backend']['jwt']['secret_key']

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
        token = request.headers.get('Authentication')
        print(token)
        logger.debug('token: ', token)
        if token is None:
            print('token is None')
            return 'no token', 401
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            sessionID = payload['jti']
            logger.info('sessionID: ', sessionID)
            assert( session['id'] == sessionID )
            if not session['authorized']:
                return 'session not authorized', 401
        except jwt.ExpiredSignatureError:
            return 'token expired', 401
        except jwt.InvalidTokenError:
            return 'invalid token', 401
        ret = func(*args, **kwargs)
        return ret
    return wrapper