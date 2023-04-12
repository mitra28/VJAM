import os
from google.cloud.sql.connector import Connector
import sqlalchemy
import pymysql
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base

# Set up the Cloud SQL connection

# initialize Connector object
connector = Connector()
# Define the database schema
Base = declarative_base()
class MyTable(Base):
    __tablename__ = 'my_table'
    id = Column(String(255), primary_key=True)
    title = Column(String(255))

def getconn() -> pymysql.connections.Connection:
    conn: pymysql.connections.Connection = connector.connect(
        "ece-461-part-2-web-service:us-central1:ece-461",
        "pymysql",
        user="root",
        password="Youwillneverguessthispassword461",
        db="ECE_461_DATABASE"
    )
    return conn

# create connection pool
engine = sqlalchemy.create_engine(
    "mysql+pymysql://",
    creator=getconn,pool_pre_ping=True)

print("Engine is created")

# Define the database schema
insert_stmt = sqlalchemy.text(
    "INSERT INTO my_table (id, title) VALUES (:id, :title)",
)

print("defining the schema")

try:
    # interact with Cloud SQL database using connection pool
    with engine.connect() as db_conn:
        # create the table if it doesn't exist
        Base.metadata.create_all(bind=engine)
        # insert into database
        db_conn.execute(insert_stmt, parameters={"id": "book1", "title": "Book One"})

        # query database
        result = db_conn.execute(sqlalchemy.text("SELECT * from my_table")).fetchall()

        # Do something with the results
        for row in result:
            print(row)
        connector.close()
except Exception as e:
    print(f"Error occurred: {e}")