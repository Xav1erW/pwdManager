# author: Xav1erW
# create date: 2022-3-29
# version: 1.0
# description: 
#   define the data model
#     PwdCollection: inherit list, which contains all the passwords(Pwd)
#     Pwd: inherit dict, which contains the information of a password
#     DataBase: defines the passwords database structure

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
        * updateTime:    the time of lastest update:  yyyy-mm-dd
        * createTime:    the time of creation of the password:  yyyy-mm-dd
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
                raise KeyError('key: ' + key + ' is not accepted')
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
        self._name = name
        self._uuid = uuid if uuid else shortuuid.uuid()
        self._pwdDict = {}
        # validation
        for pwd in pwdList:
            if(isinstance(pwd, Pwd)):
                pass
            else:
                raise TypeError('pwdList must be a list of Pwd')
        
        # generate dict and id list(store the sequence)
        if(pwdList is not None):
            self._idList = [pwd.uuid for pwd in pwdList]
            self._pwdDict = {pwd.uuid: pwd for pwd in pwdList}
        
    
    def __str__(self):
        return str(self.detailDict)

    @property
    def name(self):
        '''
        the name of the collection
        '''
        return self._name
    
    @property
    def uuid(self):
        '''
        the uuid of the collection
        '''
        return self._uuid

    @property
    def pwdDict(self):
        '''
        the dict of the collection
        '''
        return self._pwdDict

    @property
    def detailDict(self):
        '''
        the detail information dict of the collection(with name, uuid, etc.)
        '''
        return {'name': self._name, 'uuid': self._uuid, 'pwdDict': self._pwdDict, 'idList': self._idList}

    @property
    def idList(self):
        '''
        the id list of the collection(store the sequence infomation)
        '''
        return self._idList

class DataBase:
    def __init__(self, pwdCollectionList:List[PwdCollection] , **kwargs):
        self.name = kwargs.get('name', DEFAULT_NAME)
        self.uuid = kwargs.get('uuid', shortuuid.uuid())
        self.pwdCollectionIdList = [collection.uuid for collection in pwdCollectionList]
        self.pwdCollectionDict = {}
        for collection in pwdCollectionList:
            self.pwdCollectionDict[collection.uuid] = collection
    
    def __str__(self):
        return str([str(self.pwdCollectionDict[id]) for id in self.pwdCollectionIdList])

    def __getitem__(self, key):
        return self.pwdCollectionDict.get(key, None)
    

if __name__ == '__main__':
    # test the data model
    testpwd1 = Pwd('test1', '123456', username='往uaie')
    testpwd2 = Pwd('test2', '123456')
    testpwd3 = Pwd('test3', '123456')
    testpwd4 = Pwd('test4', '123456')

    testpwd_list = [testpwd1, testpwd2, testpwd3, testpwd4]
    testpwd_collection = PwdCollection('test', testpwd_list)
    testCollection = PwdCollection('test2', testpwd_list)
    testDatabase = DataBase([testpwd_collection, testCollection], name='test')
