import os
from google.cloud.sql.connector import Connector
import sqlalchemy
import pymysql
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base

def getconn() -> pymysql.connections.Connection:
    conn: pymysql.connections.Connection = connector.connect(
        "ece-461-part-2-web-service:us-central1:ece-461",
        "pymysql",
        user="",
        password="",
        db="ECE_461_DATABASE"
    )
    return conn

def create_engine_with_conn_pool() -> sqlalchemy.engine.Engine:
    engine = sqlalchemy.create_engine(
        "mysql+pymysql://",
        creator=getconn,pool_pre_ping=True)
    return engine

def create_table(engine: sqlalchemy.engine.Engine):
    Base = declarative_base()
    class MyTable(Base):
        __tablename__ = 'my_table'
        id = Column(String(255), primary_key=True)
        title = Column(String(255))
    Base.metadata.create_all(bind=engine)

def insert_data(engine: sqlalchemy.engine.Engine, id: str, title: str):
    try:
        with engine.connect() as db_conn:
            db_conn.execute(
                sqlalchemy.text("INSERT INTO my_table (id, title) VALUES (:id, :title)"),
                parameters={"id": id, "title": title})
    except Exception as e:
        print(f"Error occurred while inserting data: {e}")

def retrieve_data(engine: sqlalchemy.engine.Engine):
    try:
        with engine.connect() as db_conn:
            result = db_conn.execute(sqlalchemy.text("SELECT * from my_table")).fetchall()
            return result
    except Exception as e:
        print(f"Error occurred while retrieving data: {e}")

def main():
    engine = create_engine_with_conn_pool()
    create_table(engine)
    insert_data(engine, "book1", "Book One")
    results = retrieve_data(engine)
    for row in results:
        print(row)

if __name__ == '__main__':
    connector = Connector()
    main()
    connector.close()