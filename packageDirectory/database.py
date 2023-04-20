import pymysql
from google.cloud.sql.connector import Connector
import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, Float,LargeBinary, pool, text, exc


def getconn() -> pymysql.connections.Connection:
    conn: pymysql.connections.Connection = Connector().connect(
        "ece-461-part-2-web-service:us-central1:ece-461",
        "pymysql",
        user="root",
        password="Youwillneverguessthispassword461",
        db="ECE_461_DATABASE"
    )
    return conn


def create_engine_with_conn_pool() -> sqlalchemy.engine.Engine:
    engine = sqlalchemy.create_engine(
        "mysql+pymysql://",
        creator=getconn,
        poolclass=pool.QueuePool,
        pool_pre_ping=True)
    return engine    

def delete_table(engine, table_name):
    with engine.connect() as conn:
        stmt = text(f"DROP TABLE IF EXISTS {table_name}")
        conn.execute(stmt)
        print(f"Table {table_name} has been deleted.")


def create_table(engine):
    with engine.connect() as conn:
        stmt = text("""
            CREATE TABLE repo_info (
            id INT AUTO_INCREMENT PRIMARY KEY,
            repo_name VARCHAR(255),
            url VARCHAR(255),
            total_score FLOAT,
            ramp_up_score FLOAT,
            correctness_score FLOAT,
            bus_factor FLOAT,
            responsiveness_score FLOAT,
            license_score FLOAT,
            version_score FLOAT,
            adherence_score FLOAT
            );
        """)
        conn.execute(stmt)
        print("Table 'repo_info' created successfully.")

def insert_data(engine, repo_name, url, total_score, ramp_up_score, correctness_score,
                bus_factor, responsiveness_score, license_score, version_score, adherence_score):
    with engine.connect() as conn:
        stmt = text("""
            INSERT INTO repo_info (repo_name, url, total_score, ramp_up_score, correctness_score,
                bus_factor, responsiveness_score, license_score, version_score, adherence_score)
            VALUES (:repo_name, :url, :total_score, :ramp_up_score, :correctness_score,
                :bus_factor, :responsiveness_score, :license_score, :version_score, :adherence_score)
        """)
        try:
            conn.execute(stmt, {
                "repo_name": repo_name,
                "url": url,
                "total_score": total_score,
                "ramp_up_score": ramp_up_score,
                "correctness_score": correctness_score,
                "bus_factor": bus_factor,
                "responsiveness_score": responsiveness_score,
                "license_score": license_score,
                "version_score": version_score,
                "adherence_score": adherence_score,
            })
            print("Data inserted successfully.")
        except exc.SQLAlchemyError as e:
            print(f"Error occurred: {e}")
def main():
    # Establish a connection to the database
    engine = create_engine_with_conn_pool()
    #create_table(engine)
    #delete_table(engine, "repo_info")
    print("table created")
    insert_data(engine, "my_repo", "https://github.com/my_repo", 0.8, 0.7, 0.9, 0.6, 0.85, 0.9, 0.75, 0.8)


if __name__ == '__main__':
    main()

'''
import os
import zipfile
import io
import base64
from google.cloud import storage
from google.cloud.sql.connector import Connector
import sqlalchemy
import pymysql
from sqlalchemy import create_engine, Column, Integer, String, Float,LargeBinary
from sqlalchemy.orm import sessionmaker, declarative_base

# Set up the Cloud SQL connection
#export GOOGLE_APPLICATION_CREDENTIALS="/home/shay/a/wakanbi/VJAM/packageDirectory/serviceKey.json" 

class MyTable(Base):
    __tablename__ = 'my_table'
    id = Column(Integer, primary_key=True)
    repo_name = Column(String(255))
    url = Column(String(255))
    total_score = Column(Float)
    ramp_up_score = Column(Float)
    correctness_score = Column(Float)
    bus_factor = Column(Float)
    responsiveness_score = Column(Float)
    license_score = Column(Float)
    version_score = Column(Float)
    adherence_score = Column(Float)

Base = declarative_base()
class MyTable(Base):
    __tablename__ = 'my_table'
    id = Column(Integer, primary_key=True)
    repo_name = Column(String(255))
    url = Column(String(255))
    total_score = Column(Float)
    ramp_up_score = Column(Float)
    correctness_score = Column(Float)
    bus_factor = Column(Float)
    responsiveness_score = Column(Float)
    license_score = Column(Float)
    version_score = Column(Float)
    adherence_score = Column(Float)

class MyZipFilesTable(Base):
    __tablename__ = 'my_zip_files_table'
    id = Column(Integer, primary_key=True)#auto generated to store the row
    file_identifier = Column(String(255)) #name of the file
    zipped_file = Column(LargeBinary)    #binary version of the file   

def getconn() -> pymysql.connections.Connection:
    conn: pymysql.connections.Connection = connector.connect(
        "ece-461-part-2-web-service:us-central1:ece-461",
        "pymysql",
        user="root",
        password="Youwillneverguessthispassword461",
        db="ECE_461_DATABASE"
    )
    return conn

def create_engine_with_conn_pool() -> sqlalchemy.engine.Engine:
    engine = sqlalchemy.create_engine(
        "mysql+pymysql://",
        creator=getconn,pool_pre_ping=True)
    return engine

def create_table(engine: sqlalchemy.engine.Engine):


def defineData(id, Rname, url, total_score, ramp_score, cor_score, bus_factor, res_score, lisc_score, version_score, adhere_score):
    # define data to be inserted
    data = [{"id": id, "repo_name": Rname, "url": url,
             "total_score": total_score, "ramp_up_score": ramp_score, "correctness_score": cor_score,
             "bus_factor": bus_factor, "responsiveness_score": res_score, "license_score": lisc_score,
             "version_score": version_score, "adherence_score": adhere_score}]
    return data


def main():
    # create connection pool
    engine = create_engine_with_conn_pool()
    create_table(engine)
    data = defineData(1, "repo1","http://example.com/repo1",
    0.8, 0.7, 0.9, 0.6, 0.85, 0.9, 0.75, 0.8)

    table_description = retrieve_table_description(engine, 'MyTable')
    printOutput(table_description)
    # insert data into database
    #insert_data(engine, data)
    # retrieve data from database
    #results = retrieve_data(engine)
    printOutput(table_description)

if __name__ == '__main__':
    # initialize Connector object
    connector = Connector()
    main()
    connector.close()

#assumes the data is downloaded into the computer first and the file path is then sent to this function
def insert_zipped_file(engine: sqlalchemy.engine.Engine, file_path: str, file_identifier: str):
    try:
        with engine.connect() as db_conn:
            with open(file_path, "rb") as file:
                # read the file and encode it as base64
                encoded_file = base64.b64encode(file.read())
                # insert the encoded file and its identifier into the database
                db_conn.execute(MyZipFilesTable.__table__.insert(), {"file_identifier": file_identifier, "zipped_file": encoded_file})
    except Exception as e:
        print(f"Error occurred while inserting zipped file: {e}")    
            
#retrieve using filename or using id given??            
def retrieve_zipped_file_by_id(engine: sqlalchemy.engine.Engine, file_id: int):
    try:
        # interact with Cloud SQL database using connection pool
        with engine.connect() as db_conn:
            # query database for file with matching id
            result = db_conn.execute(MyZipFilesTable.__table__.select().where(MyZipFilesTable.id == file_id)).fetchone()
            if result:
                # create a byte stream from the binary data
                data = io.BytesIO(result.file_data)
                # instantiate a client to access Cloud Storage
                storage_client = storage.Client()
                # get a bucket reference
                bucket = storage_client.get_bucket("my-bucket-name")
                # get a blob reference
                blob = bucket.blob(f"{file_id}.zip")
                # upload the byte stream as a blob
                blob.upload_from_file(data)
                # return the public URL for the uploaded blob
                return blob.public_url
            else:
                return None
    except Exception as e:
        print(f"Error occurred while retrieving data: {e}")


   def insert_data(engine: sqlalchemy.engine.Engine, data):
    try:
        # interact with Cloud SQL database using connection pool
        with engine.connect() as db_conn:
            # create the table if it doesn't exist
            # insert data into database
            db_conn.execute(MyTable.__table__.insert(), data)
    except Exception as e:
        print(f"Error occurred while inserting data: {e}")


def retrieve_data(engine: sqlalchemy.engine.Engine):
    try:
        # interact with Cloud SQL database using connection pool
        with engine.connect() as db_conn:
            # query database
            result = db_conn.execute(MyTable.__table__.select()).fetchall()
            # return results
            return result
    except Exception as e:
        print(f"Error occurred while retrieving data: {e}")
     
'''            