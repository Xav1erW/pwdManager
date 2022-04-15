from DataModel import *
import json
class Jsonfier(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Pwd):
            return obj.dict
        elif isinstance(obj, PwdCollection):
            infoDict = obj.detailDict
            return infoDict
        elif isinstance(obj, PwdDataBase):
            infoDict = obj.__dict__
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
        collectionsIdList = obj['pwdCollectionIdList']
        collectionsDict = obj['pwdCollectionDict']
        collectionList = [parseCollection(collectionsDict[collectionId]) for collectionId in collectionsIdList]
        return PwdDataBase(collectionList, name=dbName, uuid=dbUuid)

def fromJson(dbJson):
    jsonDict = json.loads(dbJson)
    return parseDataBase(jsonDict)

def toJson(DataBaseObj):
    dbJson = json.dumps(DataBaseObj, cls=Jsonfier)
    return dbJson