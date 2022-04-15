from File.DataModel import *
from File.JsonOperation import *
from hashlib import sha256
import os
import json

class DataFile:
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
    def load(self, filePath:str):
        """
        load the data from the file

        :param filePath: the path of the password data file
        """
        if(os.path.exists(filePath)):
            with open(filePath, 'r') as f:
                self.parseFile(f)
        else:
            raise FileNotFoundError('the file does not exist')
    
    @classmethod
    def parseFile(self, file):
        """
        parse the data from the file

        :param file: the file object
        """
        # TODO
        pass
            