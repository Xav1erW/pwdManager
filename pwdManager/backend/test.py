# from File.JsonOperation import fromJson, toJson
from time import time
# from File.DataModel import *
# from File.DataFile import DataFile
from File import *
from Auth import jwtAuth
from hashlib import sha256
import sys

sys.path.append('./config.json')
"""
=================== test data init ===================
"""
# testpwd_list = [Pwd(f'test{i}',f'123456{i*i}', username=f'往uaie{i}' )for i in range(100)]

# testDatabase = PwdDataBase([PwdCollection(f'test{i}', testpwd_list) for i in range(1000)], name='test')
def test_data_init():
    testpwd_list = [Pwd(f'test{i}',f'123456{i*i}', username=f'往uaie{i}' )for i in range(100)]
    testDatabase = PwdDataBase([PwdCollection(f'test{i}', testpwd_list) for i in range(1000)], name='test')

    jsonStr = toJson(testDatabase)
    start = time()
    hash = sha256(jsonStr.encode('utf-8')).hexdigest()
    end = time()
    print(hash)
    print('hash time', end - start)
    return (testDatabase, jsonStr)

"""
=================== test File Model ===================
"""
# ---------------- test save ----------------
def test_save(testDatabase):
    key = '1234567890123456'.encode('utf-8')
    start = time()
    dataFile = DataFile('_test.edb', testDatabase)
    dataFile.save(key)
    end = time()
    print('save time: ', end - start)
# ---------------- test load ----------------
    start = time()
    result = DataFile.load('_test.edb', key)
    end = time()
    print('load time: ', end - start)


"""
=================== test jwt ===================
"""
def test_jwt(sessionId):
    k = jwtAuth.tokenGen(sessionId)
    print(k)

if __name__ == '__main__':
    testdb, jsonStr = test_data_init()
    test_save(testdb)
    test_jwt('ntdeOMFNHFl1JzTm6iNwlE')