# Auth

认证模块，用来认证jwt令牌，防止未经授权的请求读取信息

## 工作模式

### 客户端

客户端每次启动都会重新启动一次后端服务器和前端页面，后端服务器每次启动会创建一个可信页面池，存储前端uuid加盐哈希后的值；
前端页面每次启动会生成一个页面的uuid作为此次启动的编号，输入密码解密时会将该uuid一起提交给后端服务器，服务器确认密码正确后，该uuid会加盐哈希后被加入可信页面池，并返回一个jwt令牌给前端，该令牌包含前端页面的uuid。

之后前端每次请求后端数据时，都必须将该jwt令牌携带在请求头中，后端会读取令牌，验证信息和令牌中的uuid，并将uuid与可信页面池内容比较，如果uuid其中，那么认为可信，会正确返回信息，否则返回 `401`

## 模块说明

模块基本都使用decorator的形式使用

### SessionPool

每次服务器连接到一个页面时，如果页面输入密码正确，都会将页面的uuid存入SessionPool。

SessionPool 为dict形式，`key` 为页面的uuid， `value` 包含session的信息，主要有其rsa公钥，便于加密通信

### jwtAuth

服务器与页面监理会话后，会生成一个jwt令牌发送给前端，前端之后每次请求都会携带该令牌。该部分有装饰器用来验证令牌，需要提供可信的sessionpool

```python
from Auth.jwtAuth import tokenCheck, tokenGen
from Auth.SessionPool import SessionPool
from flask_pydantic import validate

class PostModel(BaseModel):
    name: str
    hash:str

class TokenModel(BaseModel):
    uuid:str

sessionPool = SessionPool()
@app.get('/api/genToken')
@validate()
def genToken(query:TokenModel):
    # generate jwt and add uuid tu session pool
    sessionPool.add(query.uuid, query.publicKey)
    return {'token': tokenGen(query.uuid)}

@app.post('/api/post')
@tokenCheck(sessionPool)        # ATTENTION! used before validate parameters
@validate()
def post(body: PostModel):
    return {'name': body.name}
```

### RSADecoder

数据都是rsa加密方式发送，因此前端post请求携带信息需要解密，利用该文件提供的装饰器进行。

**注意！由于解密需要修改request body，但暂未找到flask的支持方法，因此请使用Lib文件夹中修改过的flask_pydantic对解密后的数据进行校验**

以下代码展示包含了jwt验证和rsa解码的使用

使用顺序：
1. 校验token
2. rsa解码
3. 验证数据

```python
from Auth.SessionPool import SessionPool
from Auth.jwtAuth import tokenCheck, tokenGen
from Lib.flask_pydantic import validate
from Auth.RSADecoder import rsaDecoder

sessionPool = SessionPool()

@app.get('/api/genToken')
@validate()
def genToken(query:TokenModel):
    sessionPool.add(query.uuid, query.publicKey)
    return {'token': tokenGen(query.uuid)}


@app.post('/api/post')
@tokenCheck(sessionPool)
@rsaDecoder
@validate()
def post(body: PostModel):
    logger.debug('/api/post body: ', str(body))
    return {'name': body.name}

@app.get('/api/delToken')
@validate()
def delToken(query: TokenModel):
    sessionPool.remove(query.uuid)
    return {'status': 'ok'}
```