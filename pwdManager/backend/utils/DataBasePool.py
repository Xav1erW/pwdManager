# author: Xav1erW
# create date: 2022-4-21
# version: 1.0
# description:
#   database pool class that store the PwdDataBase uuid and its corresponding PwdDataBase object

from typing import List
from File.DataFile import PwdDataBase

# database pool class that store the PwdDataBase uuid and its corresponding PwdDataBase object
class DataBasePool:
    def __init__(self):
        """
        Database pool class that store the PwdDataBase uuid and its corresponding PwdDataBase object
        
        Every time a new PwdDataBase object is added to the pool, its ref will be increased by 1.
        
        When a PwdDataBase object is removed from the pool, its ref will be decreased by 1.
        
        If the ref is 0, the PwdDataBase object will be removed from the pool.
        """
        self.pool = {}

    def add(self, uuid:str, dataBase:PwdDataBase):
        if uuid in self.pool:
            self.pool[uuid]['ref'] += 1
        else:
            self.pool[uuid] = {'db':dataBase, 'ref':1}

    def get(self, uuid:str):
        return self.pool.get(uuid, None)

    def remove(self, uuid:str):
        if uuid in self.pool:
            self.pool[uuid]['ref'] -= 1
            if self.pool[uuid]['ref'] == 0:
                del self.pool[uuid]

    def getAll(self):
        return self.pool

    def getAllUUID(self):
        return list(self.pool.keys())

    def getAllDataBase(self)->List[PwdDataBase]:
        return list(self.pool.values())

    def getAllDataBaseUUID(self):
        return list(map(lambda x: x.uuid, self.getAllDataBase()))

    def getAllDataBaseName(self):
        return list(map(lambda x: x.name, self.getAllDataBase()))