# author: Xav1erW
# create date: 2022-4-19
# version: 1.0
# description:
#   a dict store authed user's session
#   key: session id
#   value: session rsa public key

class SessionPool:
    def __init__(self):
        self.pool = {}
    
    def add(self, sessionId:str, publicKey:str=None):
        self.pool[sessionId] = publicKey
    
    def find(self, sessionId:str)->bool:
        # if sessionId in self.pool
        return sessionId in self.pool
    
    def get(self, sessionId:str)->str:
        return self.pool[sessionId]
    
    def remove(self, sessionId:str):
        del self.pool[sessionId]
    
    def clear(self):
        self.pool.clear()
    
    def __str__(self):
        return str(self.pool)
    
    def __repr__(self):
        return str(self.pool)