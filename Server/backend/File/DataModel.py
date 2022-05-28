# author: Xav1erW
# create date: 2022-3-29
# version: 1.0
# description: 
#   define the data model
#     PwdCollection: inherit list, which contains all the passwords(Pwd)
#     Pwd: inherit dict, which contains the information of a password
#     DataBase: defines the passwords database structure

from unittest import result
import shortuuid
from typing import Iterable, List

DEFAULT_NAME = 'default'

class Pwd:
    acceptedKeys = [
        'name', 
        'uuid',
        'username',
        'password',
        'description',
        'url',
        'updateTime',   # the time of lastest update:  yyyy-mm-dd
        'createTime',   # the time of creation of the password:  yyyy-mm-dd
        'updateHistory',# update history of password:  List(maxlength: 10)
        'autoUpdate',   # need a update reminder:  Bool
        'updateDate',   # time of reminding update the password:  yyyy-mm-dd
        'autoComplete', # need the auto complete in browser:  Bool
        'matchRules',   # match url rules in browser:  List[regex](maxlength: 10)
    ]
    def __init__(self, password:str, name:str=DEFAULT_NAME, **kwargs):
        '''
        contains the password infomations

        :param name: the name of the password(nessessary)
        :param password: the password(nessessary)
        :param kwargs: the other infomations(see acceptedKeys)

        acceptedKeys:
        * name 
        * username
        * uuid
        * password
        * description
        * url
        * updateTime:    the time of lastest update:  timestamp
        * createTime:    the time of creation of the password:  timestamp
        * updateHistory: update history of password:  List(maxlength: 10)
        * autoUpdate:    need a update reminder:  Bool
        * updateDate:    time of reminding update the password:  yyyy-mm-dd
        * autoComplete:  need the auto complete in browser:  Bool
        * matchRules:    match url rules in browser:  List[regex](maxlength: 10)
        '''
        self.name = name
        self.password = password
        self.uuid = kwargs.get('uuid', shortuuid.uuid())
        # validate the kwargs
        for key in kwargs:
            if key not in self.acceptedKeys:
                raise KeyError(f'key: {key} is not accepted')
        self.__dict__.update(kwargs)
    
    def __str__(self):
        return self.__dict__.__str__()

    def __getitem__(self, key):
        return self.__dict__.get(key, None)

    @property
    def dict(self):
        return self.__dict__


class PwdCollection:
    def __init__(self, name:str=DEFAULT_NAME, pwdList:Iterable[Pwd] = None, uuid:str=None):
        self.name = name
        self.uuid = uuid if uuid else shortuuid.uuid()
        self.pwdDict = {}
        if pwdList is None:
            # 空列表，仅作初始化
            self.idList = []
            return
        # validation
        for pwd in pwdList:
            if(isinstance(pwd, Pwd)):
                pass
            else:
                raise TypeError('pwdList must be a list of Pwd')
        
        # generate dict and id list(store the sequence)
        if(pwdList is not None):
            self.idList = [pwd.uuid for pwd in pwdList]
            self.pwdDict = {pwd.uuid: pwd for pwd in pwdList}
        
    def add(self, pwd:Pwd):
        if(isinstance(pwd, Pwd)):
            self.idList.append(pwd.uuid)
            self.pwdDict[pwd.uuid] = pwd
        else:
            raise TypeError('pwd must be a Pwd')
    
    def del_item(self, uuid:str):
        if(uuid in self.pwdDict):
            self.idList.remove(uuid)
            self.pwdDict.pop(uuid)
        else:
            raise KeyError(f'uuid: {uuid} not in the collection')
    
    def __str__(self):
        return str(self.detailDict)

    def __getitem__(self, key):
        return self.pwdDict.get(key, None)

    @property
    def detailDict(self):
        '''
        the detail information dict of the collection(with name, uuid, etc.)
        '''
        return {'name': self.name, 'uuid': self.uuid, 'pwdDict': self.pwdDict, 'idList': self.idList}


class PwdDataBase:
    def __init__(self, pwdCollectionList:List[PwdCollection] , **kwargs):
        self.name = kwargs.get('name', DEFAULT_NAME)
        self.uuid = kwargs.get('uuid', shortuuid.uuid())
        self.pwdCollectionIdList = [collection.uuid for collection in pwdCollectionList]
        self.pwdCollectionDict = {collection.uuid: collection for collection in pwdCollectionList}
        # for collection in pwdCollectionList:
        #     self.pwdCollectionDict[collection.uuid] = collection
    
    def add(self, pwdCollection:PwdCollection):
        '''
        add a collection to the database
        '''
        if(isinstance(pwdCollection, PwdCollection)):
            self.pwdCollectionIdList.append(pwdCollection.uuid)
            self.pwdCollectionDict[pwdCollection.uuid] = pwdCollection
        else:
            raise TypeError('pwdCollection must be a PwdCollection')
    
    @property
    def idList(self):
        '''
        the id list of the database(store the sequence infomation)
        '''
        return self.pwdCollectionIdList

    @property
    def collectionDict(self):
        '''
        the dict of the database
        '''
        return self.pwdCollectionDict

    @property
    def detailDict(self):
        '''
        the detail information dict of the collection(with name, uuid, etc.)
        '''
        return {'name': self.name, 'uuid': self.uuid, 'collectionDict': self.pwdCollectionDict, 'idList': self.pwdCollectionIdList}

    def __str__(self):
        return str([str(self.pwdCollectionDict[id]) for id in self.pwdCollectionIdList])

    def __getitem__(self, key):
        return self.pwdCollectionDict.get(key, None)

    def search(self, name:str):
        '''
        search the pwd by name
        '''
        if name == '':
            return []
        result = [(pwd, colid) for colid in self.pwdCollectionIdList for pwd in self.pwdCollectionDict[colid].pwdDict.values() if pwd.name.find(name) != -1]
        # result = []
        # for colid in self.pwdCollectionIdList:
        #     for pwd in self.pwdCollectionDict[colid].pwdDict.values():
        #         print(pwd.name)
        #         if(pwd.name.find(name) != -1):
        #             result.append(pwd)

        return result
    
    def del_item(self, uuid:str):
        '''
        delete the collection by uuid
        '''
        if(uuid in self.pwdCollectionDict):
            self.pwdCollectionIdList.remove(uuid)
            self.pwdCollectionDict.pop(uuid)
        else:
            raise KeyError(f'uuid: {uuid} not in the database')
    

if __name__ == '__main__':
    # test the data model
    testpwd1 = Pwd('test1', '123456', username='往uaie')
    testpwd2 = Pwd('test2', '123456')
    testpwd3 = Pwd('test3', '123456')
    testpwd4 = Pwd('test4', '123456')

    testpwd_list = [testpwd1, testpwd2, testpwd3, testpwd4]
    testpwd_collection = PwdCollection('test', testpwd_list)
    testCollection = PwdCollection('test2', testpwd_list)
    testDatabase = PwdDataBase([testpwd_collection, testCollection], name='test')
