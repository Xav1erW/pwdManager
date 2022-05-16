import json
from flask import Flask,request,jsonify,session
from Lib.flask_pydantic import validate
from pydantic import BaseModel
from Auth.jwtAuth import useJWT,tokenGen
from Auth.RSA import useRSA
from DataModel import PwdDataBase,PwdCollection,Pwd
from typing import List

app = Flask(__name__)

with open('config.json', 'r') as f:
    config = json.load(f)
app.config['SECRET_KEY'] = config['session']['secret']


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

pwd_list = [Pwd('nsko7hw112ue'),Pwd('13urho32Ew2'),Pwd('p99uhwe32f')]
collection_list = [PwdCollection(pwdList=pwd_list)]
db_sample = PwdDataBase(collection_list)
db_list = [db_sample]

current_db = db_sample
current_collection = collection_list[0]

@app.route('/api/auth', methods = ['POST'])
def auth():
    sessionID = request.json.get('session id')
    publicKey = request.json.get('public key')
    print('session id',sessionID)
    print('public key',publicKey)
    session['id'] = sessionID
    session['authorized'] = True
    session['publicKey'] = publicKey
    jwt = tokenGen(sessionID)
    return jsonify({'jwt':jwt,'public key':publicKey})


@app.route('/api/fileList')
def getFileList():
    file_list = [{'name':file['name'],'uuid':file['uuid']}for file in FileList]
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
    for file in FileList:
        if file['uuid'] == uuid and file['password'] == password:
            return jsonify({'status':'success','meta': {'uuid':uuid,'name':file['name']}})
    return "密码验证失败"


@app.route('/api/collection/list')
@useJWT
def get_db():
    dbUUID = request.headers.get('dbUUID')
    for db in db_list:
        if db.uuid == dbUUID:
            global current_db
            current_db = db
            data = [{'name':name,'uuid':uuid} for name in db.nameList for uuid in db.idList]
            return jsonify({'dbname':db.name,'data':data})
    return "数据库获取失败"


class collectionModel(BaseModel):
    collectionID:str

@app.route('/api/collection/info')
@useJWT
@validate()
def get_collection(query:collectionModel):
    collectionID = query.collectionID
    collection = current_db.__getitem__(collectionID)
    global current_collection
    current_collection = collection
    data = [{'uuid':uuid,'name':name} for uuid in collection.idList for name in collection.nameList]
    return jsonify({'data':data})


class detailModel(BaseModel):
    detail: str
    uuid: str

@app.route('/api/pwd/info')
@useJWT
@validate()
def get_pwd(query:detailModel):
    uuid = query.uuid
    pwd = current_collection.__getitem__(uuid)

    title = pwd.__getitem__('name')
    username = pwd.__getitem__('username')
    password = pwd.__getitem__('password')
    url = pwd.__getitem__('url')
    description = pwd.__getitem__('description')
    if not query.detail:
        return jsonify({'title':title,'username':username,'password':password,'url':url,'description':description})
    else:
        updateTime = pwd.__getitem__('updateTime')
        createTime = pwd.__getitem__('createTime')
        updateDate = pwd.__getitem__('updateDate')
        autoComplete = pwd.__getitem__('autoComplete')
        updateHistory = pwd.__getitem__('updateHistory')
        matchRules = pwd.__getitem__('matchRules')
        return jsonify({'title':title,'username':username,'password':password,'url':url,'description':description,'updateTime':updateTime,'createTime':createTime,'updateDate':updateDate,'updateHistory':updateHistory,'autoComplete':autoComplete,'matchRules':matchRules})

class pwdModel(BaseModel):
    title:str
    username:str
    password:str
    url:str
    description:str
    updateDate:str
    createTime:str
    updateTime:str
    updateHistory:List[str]
    autoComplete: bool
    matchRules:List[str]

@app.route('/api/pwd/info', methods=['POST'])
@useJWT
@useRSA(['username','password'])
def add_pwd(query:queryModel,body:pwdModel):
    try:
        pwd = Pwd(body.password,body.title,{'username':body.username,'url':body.url,'description':body.description,'updateDate':body.updateDate,'createTime':body.createTime,'updateTime':body.updateTime,'updateHistory':body.updateHistory,'autoComplete':body.autoComplete,'matchRules':body.matchRules})
        for collection in collection_list:
            if collection.uuid == query.uuid:
                collection.pwdList.append(pwd)
                collection = PwdCollection(pwdList=collection.pwdList)
                break
        for db in db_list:
            if db == current_db:
                db = PwdDataBase(collection_list)
                break
        return jsonify({'state':'success'})
    except:
        return jsonify({'msg':"illegal parameters"})


if __name__ == '__main__':
    app.run()
