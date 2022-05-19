# author: Xav1erW
# create date: 2022-4-16
# version: 1.0
# description:
#   offer rsa encrypt and decrypt
from typing import Callable, List
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
from flask import request, session
import logging 
import json
import base64
from functools import wraps

with open('config.json', 'r') as f:
    config = json.load(f)

PRIVATE_KEY = RSA.import_key(config['RSA']['private'])

logger = logging.getLogger('Auth')
logger.setLevel(logging.DEBUG)

def useRSA(decodeParams:List[str])->Callable:
    def rsaDecoder(func:Callable)->Callable:
        """
        decorator that decode the request body with RSA private key(store in config.json)
        """
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                data = request.get_json()
                data = json.loads(data)
                cipher = PKCS1_v1_5.new(PRIVATE_KEY)
                for key in decodeParams:
                    # only decode the params in decodeParams
                    if key in data.keys():
                        if(isinstance(data[key], str)):
                            data[key] = cipher.decrypt(base64.b64decode(data[key]), data[key])
                        elif (isinstance(data[key], list)):
                            for i in range(len(data[key])):
                                data[key][i] = cipher.decrypt(base64.b64decode(data[key][i]), data[key][i])
                        else:
                            raise Exception('data type error')
                logger.info('decode data: ', data)
                ret = func(*args, **kwargs, modified_request_body=data)
                return ret
            except Exception as e:
                logger.error(data)
                logger.error(f"[RSA]: {e}")
                return str(e), 401
        return wrapper
    return rsaDecoder

def encodeWithRSA(data:bytes)->str:
    """
    encode the data with RSA public key(get from session pool)
    """
    publicKey = session['publicKey']
    cipher = PKCS1_v1_5.new(publicKey)
    dataEncrypted = cipher.encrypt(data)
    return base64.b64encode(dataEncrypted).decode()