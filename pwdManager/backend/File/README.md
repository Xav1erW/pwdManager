# 模块说明

该模块内均为文件相关操作，在数据读取、更新、保存是调用

## DataModel

该文件定义了密码数据库对象，包含三个层次

* Pwd：单个密码数据对象，包含一个密码的所有信息作为对象的属性，可以用类似字典的 `instance[attribute]` 方法获取属性，也可以利用 `instance.dict` 直接将对象转化为字典
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
* PwdCollection：一个密码集合的数据类型，用户可将相似平台的密码放入一个collection中。主要结构为 `_pwdDict` 中存放着以 `Pwd` 实例 `uuid` 为键，`Pwd` 实例为值的一个字典，`_idList` 存放着 `uuid` 的顺序。由于定义了 `__getitem__` 因此可以利用类似字典的方法，通过uuid读取密码信息 `instance[uuid]`
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

* PwdDataBase：一个完整密码数据库的定义，结构和PwdCollection类似，由一个包含若干collection信息的字典和一个collection的uuid的字典构成。

```python
database = PwdDataBase(
    name = '测试数据库',
    pwdCollectionList = [collection1, collection2, collection3]
)

# read data in order
for uuid in database.idList:
    collectionInfo = database[uuid]
```