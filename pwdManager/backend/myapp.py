import json
from flask import Flask,request,jsonify,session, Response
from flask_cors import CORS
from Lib.flask_pydantic import validate
from pydantic import BaseModel
from Auth.jwtAuth import useJWT,tokenGen
from Auth.RSA import useRSA, encodeWithRSA
from File.DataModel import PwdDataBase,PwdCollection,Pwd
from File.DataFile import DataFile
from typing import List, Optional
import time
import os
import logging

app = Flask(__name__, static_url_path='/', static_folder='../gui')
# CORS(app, supports_credentials=True, origins=['http://localhost:3000'], allow_headers=['Content-Type', 'Authentication', 'dbUUID'], expose_headers=['Authentication'])
with open('config.json', 'r') as f:
    config = json.load(f)
app.config['SECRET_KEY'] = config['backend']['session']['secret']

# logging.basicConfig(filename='log.txt', level=logging.INFO)

appPublicKey = config['backend']['RSA']['public']

FileList = [
  {
    "name": "cype",
    "uuid": "jL1W4eM1izqyDhISofHhSU",
    "password": "jdsokuovjkjwasdwee"
  },
  {
    "name": "lbuwq",
    "uuid": "MEUq9omuYXP478i32x46xw",
    "password": "UInjewdsEJJwuHBhjeb"
  },
  {
    "name": "lrrr",
    "uuid": "YBexJYHnEzH1UuWcDl3k2g",
    "password": "kjnIHnjBhSbjbvdxrSj"
  },
  {
      "name": "wueb",
      "uuid": "NS3Am8BDHTf3VfMdMgDN4a",
      "password": "716J4px881qBY391*[dw2Zo"
  }
]

# pwd_list = [Pwd('nsko7hw112ue'),Pwd('13urho32Ew2'),Pwd('p99uhwe32f')]
# collection_list = [PwdCollection(pwdList=pwd_list)]
# db_sample = PwdDataBase(collection_list)
# db_list = [db_sample]

# 测试用的密码文件是test.pwdb，用下面的方式读取
# db = DataFile.load('./TestDB/test.pwdb', key='test_db'.encode('utf-8'))
# 找密码文件也在TestDB下找
# 读取的时候用os遍历目录，通过Digest读取uuid
def get_db_path():
    dbfolder = os.path.join(os.path.dirname(__file__), 'TestDB')
    return dbfolder

def get_db_list():
    dbFolder = get_db_path()
    print(dbFolder)
    dbfiles = os.listdir(dbFolder)
    db_list = [{"uuid":DataFile(os.path.join(dbFolder, dbfile) , read=True).getDigest()['uuid'], "name":dbfile.split('.')[0], "db": DataFile(os.path.join(dbFolder, dbfile), read=True)} for dbfile in dbfiles]
    return db_list
current_db:PwdDataBase = None
# current_collection = collection_list[0]

# 保存已经验证过密码的数据库
# {uuid:db}
decryptedDBs = {}

# app.config.update(
#     SESSION_COOKIE_SECURE=True,
#     SESSION_COOKIE_HTTPONLY=True,
#     SESSION_COOKIE_SAMESITE='None',
# )

def save_current_db():
    dbFolder = get_db_path()
    current_db:PwdDataBase = decryptedDBs.get(session['dbUUID'], None)['db']
    currentdb_pwd = decryptedDBs.get(session['dbUUID'], None)['password']
    name = current_db.name
    dbPath = os.path.join(dbFolder, name+".pwdb")
    
    new_file = DataFile(dbPath,current_db, update=True, read=False)
    # new_file.save(password.encode('utf-8'),'./TestDB/'+name,True)
    new_file.save(currentdb_pwd.encode('utf-8'))

class authData(BaseModel):
    sessionID: str
    publicKey: str

@app.route('/api/auth', methods = ['POST'])
@validate()
def auth(body: authData):
    # sessionID = request.json.get('session id')
    # publicKey = request.json.get('public key')
    sessionID = body.sessionID
    publicKey = body.publicKey
    print('session id',sessionID)
    print('public key',publicKey)
    session['id'] = sessionID
    session['authorized'] = True
    session['publicKey'] = publicKey
    jwt = tokenGen(sessionID)
    return jsonify({'jwt':jwt,'public_key':appPublicKey})


@app.route('/api/fileList')
def getFileList():
    # file_list = [{'name':file['name'],'uuid':file['uuid']}for file in FileList]
    dbs = get_db_list()
    file_list = [{'name':db['name'],'uuid':db['uuid']}for db in dbs]
    return jsonify({'data': file_list})


class queryModel(BaseModel):
    uuid: str
class verifyModel(BaseModel):
    password: str

@app.route('/api/verify',methods = ['POST'])
@useJWT
@useRSA(['password'])
@validate()
def login(query:queryModel,body:verifyModel):
    uuid = query.uuid
    password = body.password
    print('password',password)
    dbs = get_db_list()
    for db in dbs:
        if db['uuid'] == uuid:
            dbfile:DataFile = db['db']
            print(dbfile)
            # global current_db
            current_db = DataFile.load(dbfile.filePath, password.encode('utf-8'))
            decryptedDBs[current_db.uuid] = {'db':current_db,'password':password}
            session['dbUUID'] = current_db.uuid
            return {
                "status": "success",
                "meta":{
                    "uuid": uuid,
                    "name": db['name']
                }
            }
    # for file in FileList:
    #     if file['uuid'] == uuid and file['password'] == password:
    #         return jsonify({'status':'success','meta': {'uuid':uuid,'name':file['name']}})
    return Response(jsonify({"msg":"密码验证失败"}),status=403) 


@app.route('/api/collection/list')
@useJWT
def get_db():
    dbUUID = request.headers.get('dbUUID')
    current_db:PwdDataBase = decryptedDBs.get(dbUUID, False)['db']
    print('current_db',current_db)
    # if(current_db == None or current_db['uuid'] != dbUUID):
    if(not current_db):
        return jsonify({'status':'fail','msg':'db not authed'}), 403
    # for db in db_list:
    #     if db.uuid == dbUUID:
    #         global current_db
    #         current_db = db
    #         data = [{'name':name,'uuid':uuid} for uuid in db.idList for name in db[uuid].name ]
    data = [{'name':current_db[uuid].name,'uuid':uuid} for uuid in current_db.idList ]
    print(data)
    return jsonify({'dbname':current_db.name,'data':data})
    # return {"msg":f"数据库获取失败，uuid:{dbUUID}"}


class collectionModel(BaseModel):
    collectionID:str

@app.route('/api/collection/info')
@useJWT
@validate()
def get_collection(query:collectionModel):
    collectionID = query.collectionID
    current_db:PwdDataBase = decryptedDBs.get(session['dbUUID'], None)['db']
    # print('dbs',decryptedDBs)
    # print('current_db',current_db)
    collection = current_db[collectionID]
    # global current_collection
    # current_collection = collection
    if(collection.idList == []):
        return jsonify({'data': []}), 200
    data = [{'uuid':uuid,'name':collection[uuid].name} for uuid in collection.idList ]
    return jsonify({'data':data})


class detailModel(BaseModel):
    detail: str
    pwdUUID: str
    collectionUUID:str

@app.route('/api/pwd/info', methods = ['GET'])
@useJWT
@validate()
def get_pwd(query:detailModel):
    colID = query.collectionUUID
    uuid = query.pwdUUID
    current_db = decryptedDBs.get(session['dbUUID'], None)['db']
    pwd = current_db[colID][uuid]

    title = pwd['name']
    username = encodeWithRSA(pwd['username'].encode('utf-8'))
    password = encodeWithRSA(pwd['password'].encode('utf-8'))
    url = pwd['url']
    description = pwd['description']
    if not query.detail:
        return jsonify({'title':title,'username':username,'password':password,'url':url,'description':description})
    else:
        updateTime = pwd['updateTime']
        createTime = pwd['createTime']
        updateDate = pwd['updateDate']
        autoComplete = pwd['autoComplete']
        updateHistory = [encodeWithRSA(his.encode('utf-8')) for his in pwd['updateHistory']]
        matchRules = pwd['matchRules']
        return jsonify({'title':title,'username':username,'password':password,'url':url,'description':description,'updateTime':updateTime,'createTime':createTime,'updateDate':updateDate,'updateHistory':updateHistory,'autoComplete':autoComplete,'matchRules':matchRules})

class pwdModel(BaseModel):
    title:str
    username:str
    password:str
    url:Optional[str]
    description:Optional[str]
    autoComplete: Optional[bool]
    matchRules:Optional[List[str]]


@app.route('/api/pwd/create', methods=['POST'])
@useJWT
@useRSA(['username','password', 'updateHistory'])
@validate()
def add_pwd(query:queryModel,body:pwdModel):
    try:
        timestamp = int(time.time())
        pwd = Pwd(body.password,body.title,**{'username':body.username,'url':body.url,'description':body.description,'updateDate':timestamp,'createTime':timestamp,'updateTime':timestamp,'updateHistory':[],'autoComplete':body.autoComplete,'matchRules':body.matchRules})
        current_db:PwdDataBase = decryptedDBs.get(session['dbUUID'], None)['db']
        collection = current_db[query.uuid]
        collection.add(pwd)
        # for collection in collection_list:
        #     if collection.uuid == query.uuid:
        #         collection.pwdList.append(pwd)
        #         collection = PwdCollection(pwdList=collection.pwdList)
        #         break
        # for db in db_list:
        #     if db == current_db:
        #         db = PwdDataBase(collection_list)
        #         break
        title = pwd['name']
        username = encodeWithRSA(pwd['username'].encode('utf-8'))
        password = encodeWithRSA(pwd['password'].encode('utf-8'))
        url = pwd['url']
        description = pwd['description']
        updateTime = pwd['updateTime']
        createTime = pwd['createTime']
        updateDate = pwd['updateDate']
        autoComplete = pwd['autoComplete']
        updateHistory = [encodeWithRSA(his.encode('utf-8')) for his in pwd['updateHistory']]
        matchRules = pwd['matchRules']
        save_current_db()
        return jsonify({'state':'success', 'data':{'title':title,'username':username,'password':password,'url':url,'description':description,'updateTime':updateTime,'createTime':createTime,'updateDate':'','updateHistory':updateHistory,'autoComplete':autoComplete,'matchRules':matchRules}})
    except Exception as e:
        print(e)
        return jsonify({'msg':e}), 400


class udtModel(BaseModel):
    pwdID: str
    collectionID: str

class udtPwdModel(BaseModel):
    title: Optional[str]
    username: Optional[str]
    password: Optional[str]
    url: Optional[str]
    description: Optional[str]
    autoComplete: Optional[bool]
    matchRules: Optional[List[str]]
    updateDate:Optional[str]

@app.route('/api/pwd/update', methods=['POST'])
@useJWT
@useRSA(['username','password'])
@validate()
def update_pwd(query:udtModel, body:udtPwdModel):
    pwdID = query.pwdID
    collectionID = query.collectionID
    current_db: PwdDataBase = decryptedDBs.get(session['dbUUID'], None)['db']
    pwd = current_db[collectionID][pwdID]

    if body.title:
        pwd.name = body.title
    if body.username:
        pwd.username = body.username
    if body.password:
        if pwd.updateHistory:
            pwd.updateHistory.append(pwd.password)
        else:
            pwd.updateHistory=[pwd.password]
        pwd.password = body.password
    if body.url:
        pwd.url = body.url
    if body.description:
        pwd.description = body.description
    if body.autoComplete:
        pwd.autoComplete = body.autoComplete
    if body.matchRules:
        pwd.matchRules = body.matchRules
    if body.updateDate:
        pwd.updateDate = body.updateDate

    pwd.updateTime= int(time.time())
    save_current_db()
    return jsonify({"status":"success"})

class searchpwdModel(BaseModel):
    name: str

@app.route('/api/search')
@useJWT
@validate()
def search_pwd(query:searchpwdModel):
    name = query.name
    current_db:PwdDataBase = decryptedDBs.get(session['dbUUID'], None)['db']
    res = current_db.search(name)
    # data = [{'name': name, 'uuid': pwd.uuid} for collection in res for pwd in collection.pwdDict.values() if pwd.name == name]
    data = [{'name': pwd[0].name, 'pwdID': pwd[0].uuid, 'colID':pwd[1]} for pwd in res]
    return jsonify(data)


class addCollectionModel(BaseModel):
    name: str

class updateCollectionModel(BaseModel):
    name: str
    collectionID: str

@app.route('/api/collection/create', methods=['POST'])
@useJWT
@validate()
def create_collection(body:addCollectionModel):
    current_db:PwdDataBase = decryptedDBs.get(session['dbUUID'], None)['db']
    currentdb_pwd = decryptedDBs.get(session['dbUUID'], None)['password']
    newCol = PwdCollection(name=body.name)
    current_db.add(newCol)
    # 保存到文件
    # save_db(current_db, currentdb_pwd)
    save_current_db()
    # data = [{'uuid':uuid,'name':current_db[uuid].name} for uuid in current_db.idList ]
    return jsonify({'status':'success','data':{'uuid':newCol.uuid,'name':newCol.name}})


@app.route('/api/collection/update', methods=['POST'])
@useJWT
@validate()
def update_collection(body:updateCollectionModel):
    current_db:PwdDataBase = decryptedDBs.get(session['dbUUID'], None)['db']
    current_db[body.collectionID].name = body.name
    # 保存到文件
    # save_db(current_db, currentdb_pwd)
    save_current_db()
    # data = [{'uuid':uuid,'name':current_db[uuid].name} for uuid in current_db.idList ]
    return jsonify({'status':'success', 'data':{'uuid':body.collectionID,'name':body.name}})


class addDBModel(BaseModel):
    name: str
    password: str


@app.route('/api/database/create', methods=['POST'])
@useJWT
@useRSA(['password'])
@validate()
def create_db(body:addDBModel):
    name, password = body.name, body.password
    new_db = PwdDataBase([PwdCollection()],**{'name': name})
    decryptedDBs[session['dbUUID']] = {'db': new_db, 'password': password}
    dbFolder = get_db_path()
    dbPath = os.path.join(dbFolder, name+".pwdb")
    if(os.path.exists(dbPath)):
        return jsonify({'status':'fail','msg':'db already exists'}), 400
    new_file = DataFile(dbPath,new_db, read=False)
    print('new_file',new_file)
    # new_file.save(password.encode('utf-8'),'./TestDB/'+name,True)
    new_file.save(password.encode('utf-8'))
    return jsonify({'status': 'success', 'data':{'name': name, 'uuid':new_file.getDigest()['uuid']}})


class delPwdModel(BaseModel):
    colID: str
    pwdID: str


@app.route('/api/pwd/del')
@useJWT
@validate()
def del_pwd(query:delPwdModel):
    current_db:PwdDataBase = decryptedDBs.get(session['dbUUID'], None)['db']
    collection = current_db[query.colID]
    collection.del_item(query.pwdID)
    save_current_db()
    return jsonify({'status':'success'})


class delColModel(BaseModel):
    colID: str

@app.route('/api/collection/delete')
@useJWT
@validate()
def del_col(query:delColModel):
    current_db:PwdDataBase = decryptedDBs.get(session['dbUUID'], None)['db']
    current_db.del_item(query.colID)
    save_current_db()
    collectionList = [{'uuid':uuid,'name':current_db[uuid].name} for uuid in current_db.idList ]
    return jsonify({'status':'success', 'collectionList':collectionList})



if __name__ == '__main__':
    app.run(port='5000',debug=True)
