# author: Xav1erW
# create date: 2022-3-29
# version: 1.0
# description: 
#   provide json operation of pwd data model

from File.DataModel import *
import json
class Jsonfier(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Pwd):
            return obj.dict
        elif isinstance(obj, PwdCollection):
            infoDict = obj.detailDict
            return infoDict
        elif isinstance(obj, PwdDataBase):
            infoDict = obj.detailDict
            return infoDict
        return json.JSONEncoder.default(self, obj)


def parseDataBase(obj):
    def parseCollection(obj):
        '''
        parse the collection object from json
        :param obj: the collection object parsed from json
        '''
        collectionName = obj['name']
        collectionUuid = obj['uuid']
        pwdIdList = obj['idList']
        pwdsDict = obj['pwdDict']
        pwdList = [Pwd(**pwdsDict[pwdId]) for pwdId in pwdIdList]
        return PwdCollection(collectionName, pwdList, uuid=collectionUuid)
    
    dbName  = obj['name']
    dbUuid = obj['uuid']
    collectionsIdList = obj['idList']
    collectionsDict = obj['collectionDict']
    collectionList = [parseCollection(collectionsDict[collectionId]) for collectionId in collectionsIdList]
    result = PwdDataBase(collectionList, name=dbName, uuid=dbUuid)
    return result

def fromJson(dbJson:str):
    jsonDict = json.loads(dbJson)
    result = parseDataBase(jsonDict)
    return result

def toJson(DataBaseObj:PwdDataBase):
    dbJson = json.dumps(DataBaseObj, cls=Jsonfier)
    return dbJson