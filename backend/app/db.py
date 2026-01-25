from prisma import Prisma

class Database:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance.db = Prisma()
        return cls._instance

    @property
    def client(self) -> Prisma:
        return self.db

db_manager = Database()

async def get_db():
    if not db_manager.client.is_connected():
        await db_manager.client.connect()
    return db_manager.client
