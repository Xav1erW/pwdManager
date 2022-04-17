# a set store authed user's session
class SessionPool:
    def __init__(self):
        self.pool = set()

    def add(self, session):
        self.pool.add(session)

    def remove(self, session):
        self.pool.remove(session)

    def get(self, session):
        return session in self.pool

    def getAll(self):
        return self.pool
    
    def find(self, session):
        return session in self.pool