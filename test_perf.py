import time
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()

class TestModel(Base):
    __tablename__ = 'test_model'
    id = Column(Integer, primary_key=True)
    baby_id = Column(Integer)
    is_deleted = Column(Boolean, default=False)

engine = create_engine('sqlite:///:memory:')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
db = Session()

# Insert 10000 records
for i in range(10000):
    db.add(TestModel(baby_id=1))
db.commit()

# Test 1: all() + loop
start = time.time()
records = db.query(TestModel).filter(TestModel.baby_id == 1).all()
for r in records:
    r.is_deleted = True
db.commit()
print(f"Loop time: {time.time() - start:.4f}s")

# Reset
for r in records:
    r.is_deleted = False
db.commit()

# Test 2: update()
start = time.time()
db.query(TestModel).filter(TestModel.baby_id == 1).update({"is_deleted": True}, synchronize_session=False)
db.commit()
print(f"Update time: {time.time() - start:.4f}s")
