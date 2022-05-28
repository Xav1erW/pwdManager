# author: Xav1erW
# create date: 2022-3-29
# version: 1.0
# description: 
#   provide file operation of pwd data model

from io import BytesIO
from File.DataModel import *
from File.JsonOperation import *
from File.Crypro import *
from hashlib import sha256, md5
import os
import json
import logging
import struct

logger = logging.getLogger('File')

class DataFile:
    HEAD = {
        'version': 0x01,
        'contentOffset': 0x0000003D, 
        'collectionCount': 0x0000,
        'uuid': '',     # 22 bytes
        'hash': ''      # 32 bytes
    }
    def __init__(self, filePath:str, dataObj:PwdDataBase=None, update:bool=False, read:bool=True):
        """
        from the password data file load the data

        :param filePath: the path of the password data file
        :param dataObj: the password database object (detail in DataModel)
        :param update: if the data file is to update or to create a new one
        """
        self.filePath = filePath
        self.dataObj = dataObj
        print("initing DataFile")
        if (read):
            print('read the file')
            self.file = open(self.filePath, 'rb+')
        elif(update):
            logger.info('update a file')
            print('update a file')
            self.file = open(self.filePath, 'wb+')
        elif(not os.path.exists(self.filePath)):
            logger.info('create a file')
            # print('create or update a file')
            self.file = open(self.filePath, 'wb+')
        elif(os.path.exists(self.filePath) and ((not read) or (not update))):
            raise FileExistsError('the file already exists')
        
    
    @classmethod
    def load(self, filePath:str=None, key:bytes=None):
        """
        load the data from the file

        :param filePath: the path of the password data file
        :param key: the key to decrypt the file
        """
        
        if(filePath and os.path.exists(filePath)):
            with open(filePath, 'rb+') as f:
                return self.parseFile(f , key)
        elif(not filePath and self.file):
            return self.parseFile(self.file, key)
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
        # hash: 32 bytes
        rawHead = struct.unpack('=BIH22s32s', file.read(offset))
        head['version'] = rawHead[0]
        head['contentOffset'] = rawHead[1]
        head['collectionCount'] = rawHead[2]
        head['uuid'] = rawHead[3].decode('utf-8')
        head['hash'] = rawHead[4]

        # ============ read the content ===========

        # ------ file validation ------
        if(head['version'] != self.HEAD['version']):
            raise ValueError('the file version is not supported')
        else:
            # validate the hash
            # file.seek(offset+1)
            contentBytes = file.read()
            hash = sha256(contentBytes)
            # if(hash.digest() != head['hash']):
            #     raise ValueError(f'the file hash is not valid, it may be damaged\n{hash.digest()}\n{head["hash"]}')

        # ------ decryption ------
        iv = head['uuid'][:16].encode('utf-8')
        if(key is not None):
            # decrypt the content
            key = md5(key).digest()[:16]
            content = decryptJson(contentBytes.decode('utf-8'), key, iv)
            return fromJson(content)
        else:
            raise ValueError('the key is not provided')

    def save(self, key:bytes, path:str=None , update:bool=False):
        """
        save the data to the file

        :param key: the key to encrypt the file
        :param path: the path to save the file
        :param update: if the data file is to update or to create a new one
        """
        if(path):
            if(os.path.exists(self.filePath) and not update):
                raise FileExistsError('the file already exists')
            print('opening file')
            file = open(path, 'wb+')
        else:
            print('use the current file')
            if(self.file.closed):
                self.file = open(self.filePath, 'wb+')
            file = self.file
            file.seek(0)
        # =========== construct the header ===========
        head = self.HEAD.copy()
        head['uuid'] = self.dataObj.uuid
        head['collectionCount'] = len(self.dataObj.idList)

        # ============ encrypt the content ===========
        # ------ encryption ------
        iv = head['uuid'][:16].encode('utf-8')
        content = toJson(self.dataObj)
        # use md5 hash generate 16bytes key to support AES-128
        key = md5(key).digest()[:16]
        contentBytes = encryptJson(content.encode('utf-8'), key, iv)
        # complete the header
        head['hash'] = sha256(contentBytes).digest()

        # ------ write the content ------
        
        # the head struct:
        # version: 1 byte
        # contentOffset: 4 bytes
        # collectionCount: 2 bytes
        # uuid: 22 bytes
        # hash: 32 bytes
        headTuple = (head['version'], head['contentOffset'], head['collectionCount'], head['uuid'].encode('utf-8'), head['hash'])
        headBytes = struct.pack('=BIH22s32s', *headTuple)
        file.write(headBytes)
        file.write(contentBytes)
        file.close()
    
    def getDigest(self):
        """
        get the digest of the file

        :return: the digest of the file
        """
        # =========== read the header ===========
        head = self.HEAD.copy()
        offset = self.HEAD['contentOffset']

        # the head struct:
        # version: 1 byte
        # contentOffset: 4 bytes
        # collectionCount: 2 bytes
        # uuid: 22 bytes
        # hash: 32 bytes
        if(self.file.closed):
            self.file = open(self.filePath, 'rb+')
        else:
            self.file.seek(0)
        rawHead = struct.unpack('=BIH22s32s', self.file.read(offset))
        head['version'] = rawHead[0]
        head['contentOffset'] = rawHead[1]
        head['collectionCount'] = rawHead[2]
        head['uuid'] = rawHead[3].decode('utf-8')
        head['hash'] = rawHead[4]
        return head