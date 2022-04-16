# author: Xav1erW
# create date: 2022-3-29
# version: 1.0
# description: 
#   provide file operation of pwd data model

from io import BytesIO
from File.DataModel import *
from File.JsonOperation import *
from File.crypro import *
from hashlib import sha256
import os
import json
import struct

class DataFile:
    HEAD = {
        'version': 0x01,
        'contentOffset': 0x0000005D, 
        'collectionCount': 0x0000,
        'uuid': '',     # 22 bytes
        'hash': ''      # 64 bytes
    }
    def __init__(self, filePath:str, dataObj:PwdDataBase, update:bool=False):
        """
        from the password data file load the data

        :param filePath: the path of the password data file
        :param dataObj: the password database object (detail in DataModel)
        :param update: if the data file is to update or to create a new one
        """
        self.filePath = filePath
        self.dataObj = dataObj
        if(os.path.exists(self.filePath) and not update):
            raise FileExistsError('the file already exists')
        else:
            self.file = open(self.filePath, 'wb')
    
    @classmethod
    def load(self, filePath:str, key:bytes=None):
        """
        load the data from the file

        :param filePath: the path of the password data file
        """
        if(os.path.exists(filePath)):
            with open(filePath, 'rb') as f:
                return self.parseFile(f , key)
        else:
            raise FileNotFoundError('the file does not exist')
    
    @classmethod
    def parseFile(self, file:BytesIO, key:bytes=None):
        """
        parse the data from the file

        :param file: the file object
        :param key: the key to decrypt the file
        """
        # =========== read the header ===========
        head = self.HEAD.copy()
        offset = self.HEAD['contentOffset']

        # the head struct:
        # version: 1 byte
        # contentOffset: 4 bytes
        # collectionCount: 2 bytes
        # uuid: 22 bytes
        # hash: 64 bytes
        rawHead = struct.unpack('=BIH22s64s', file.read(offset))
        head['version'] = rawHead[0]
        head['contentOffset'] = rawHead[1]
        head['collectionCount'] = rawHead[2]
        head['uuid'] = rawHead[3].decode('utf-8')
        head['hash'] = rawHead[4].decode('utf-8')

        # ============ read the content ===========

        # ------ file validation ------
        if(head['version'] != self.HEAD['version']):
            raise ValueError('the file version is not supported')
        else:
            # validate the hash
            # file.seek(offset+1)
            contentBytes = file.read()
            hash = sha256(contentBytes)
            if(hash.hexdigest() != head['hash']):
                raise ValueError('the file hash is not valid, it may be damaged')

        # ------ decryption ------
        iv = head['uuid'][:16].encode('utf-8')
        if(key is not None):
            # decrypt the content
            content = decryptJson(contentBytes.decode('utf-8'), key, iv)
            return fromJson(content)
        else:
            raise ValueError('the key is not provided')

    def save(self, key:bytes, path:str=None , update:bool=False):
        """
        save the data to the file

        :param key: the key to encrypt the file
        """
        if(path):
            if(os.path.exists(self.filePath) and not update):
                raise FileExistsError('the file already exists')
            file = open(path, 'wb')
        else:
            file = self.file
        # =========== construct the header ===========
        head = self.HEAD.copy()
        head['uuid'] = self.dataObj.uuid
        head['collectionCount'] = len(self.dataObj.idList)

        # ============ encrypt the content ===========
        # ------ encryption ------
        iv = head['uuid'][:16].encode('utf-8')
        content = toJson(self.dataObj)
        contentBytes = encryptJson(content.encode('utf-8'), key, iv)
        # complete the header
        head['hash'] = sha256(contentBytes).hexdigest()

        # ------ write the content ------
        
        # the head struct:
        # version: 1 byte
        # contentOffset: 4 bytes
        # collectionCount: 2 bytes
        # uuid: 22 bytes
        # hash: 64 bytes
        headTuple = (head['version'], head['contentOffset'], head['collectionCount'], head['uuid'].encode('utf-8'), head['hash'].encode('utf-8'))
        headBytes = struct.pack('=BIH22s64s', *headTuple)
        file.write(headBytes)
        file.write(contentBytes)
        file.close()