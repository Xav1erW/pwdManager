from typing import Callable
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
from flask import request
import logging 
import json
import base64
from functools import wraps

with open('config.json', 'r') as f:
    config = json.load(f)

PRIVATE_KEY = RSA.import_key(config['RSA']['private'])
PUBLIC_KEY = RSA.import_key(config['RSA']['public'])

logger = logging.getLogger('Auth')
logger.setLevel(logging.DEBUG)

def rsaDecoder(func:Callable)->Callable:
    """
    decorator that decode the request body with RSA private key(store in config.json)
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            data = request.get_json()
            cipher = PKCS1_v1_5.new(PRIVATE_KEY)
            dataDecrypted = cipher.decrypt(base64.b64decode(data['data']), 'decode failed')
            dataStr = json.loads(dataDecrypted)
            ret = func(*args, **kwargs, modified_request_body=dataStr)
            return ret
        except Exception as e:
            logger.error(e)
            return str(e), 401
    return wrapper