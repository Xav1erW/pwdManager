# 模块说明

该模块内均为文件相关操作，在数据读取、更新、保存是调用

## DataModel

该文件定义了密码数据库对象，包含三个层次

### Pwd

单个密码数据对象，包含一个密码的所有信息作为对象的属性，可以用类似字典的 `instance[attribute]` 方法获取属性，也可以利用 `instance.dict` 直接将对象转化为字典

```python
# create
pwd = Pwd(
    'name' = '测试密码',
    'username' = 'foo@foomail.com',
    'password' = '123456qwer',
    'description' = '这是测试用密码数据',
    'url' = 'test.password.com',
    'updateTime' = 1650033888,
    'createTime' = 1650033888,
    'updateHistory' = {
        'updatetime':1650033888, 'password':'12345'
    },
    'autoUpdate' = false, 
    'updateDate' = '2022-4-20',
    'autoComplete' = true
)

# get attribute
username = pwd['username']
password = pwd['password']
uuid = pwd['uuid']

# get the attribute dict
pwdDict = pwd.dict
```
### PwdCollection

一个密码集合的数据类型，用户可将相似平台的密码放入一个collection中。主要结构为 `_pwdDict` 中存放着以 `Pwd` 实例 `uuid` 为键，`Pwd` 实例为值的一个字典，`_idList` 存放着 `uuid` 的顺序。由于定义了 `__getitem__` 因此可以利用类似字典的方法，通过uuid读取密码信息 `instance[uuid]`

```python
# initialize
collection = PwdCollection(
    name = '合集名称', 
    pwdList = [pwd1, pwd2, pwd3]
)

# read data in order
for uuid in collection.idList:
    pwdInfo = collection[uuid]

# get the collection info
collectionDict = collection.detailDict
```

### PwdDataBase

一个完整密码数据库的定义，结构和PwdCollection类似，由一个包含若干collection信息的字典和一个collection的uuid的字典构成。

```python
database = PwdDataBase(
    name = '测试数据库',
    pwdCollectionList = [collection1, collection2, collection3]
)

# read data in order
for uuid in database.idList:
    collectionInfo = database[uuid]
```

## JsonOperation

通过继承 `json.JSONEncoder` 创建针对 `PwdDataBase`、 `PwdCollection`、 `Pwd` 的 json化支持

```python
# from File.JsonOperation import fromJson, toJson
from File import fromJson, toJson
testdb = PwdDataBase()
testJson = toJson(testdb)   # generate json of PwdDataBase

testdb2 = fromJson(testJson)    # generate PwdDataBase from json
```

## Crypto

完成了通过使用aes对json数据的加密解密

```python
import json
from File import encryptJson, decryptJson
jsonStr = """
{
    "test":"test data"
}
"""

jsonBytes = json.dumps(jsonStr)

jsonEncrypted = encryptJson(jsonBytes)      # from json (dumped to bytes) get encrypted base64 encoded str

jsonDecrypted = decryptJson(jsonBytes)      # from encrypted base64 encoded str get json (str)
```

## DataFile

文件结构参考 [后端README](../README.md#文件结构)

`DataFile` 实现了从 `PwdDataBase` 生成文件

类的方法有：

* `load(filePath:str, key:bytes=None)` 从给定路径和给定key读取并解密文件，返回一个 `PwdDataBase` 实例

* `parseFile(file:BytesIO, key:bytes=None)` 从给定文件流和给定key读取并解密文件，返回一个 `PwdDataBase` 实例

实例方法有：

* `save(key:bytes, path:str=None , update:bool=False)` 保存实例中的密码信息到文件中。 `update` 参数代表是否为更新文件，如果为 `False` ，而 `path` 指向已经存在的文件，则会报错；否则会覆盖文件并重新写入。

```python
testpwd_list = [Pwd('test','123456', username='往uaie' )]

testDatabase = PwdDataBase([PwdCollection('testCollection', testpwd_list)], name='test')

# saving pwd data to file
key = '1234567890123456'.encode('utf-8')
dataFile = DataFile('test.pwdb', testDatabase)
dataFile.save(key)

# loading pwd data from file
loadedDataBase = DataFile.load('test.pwdb', key=key)
```