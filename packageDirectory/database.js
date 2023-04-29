process.env.GOOGLE_APPLICATION_CREDENTIALS = "/home/shay/a/wakanbi/VJAM/packageDirectory/ServiceKey.json";

//const mysql = require('mysql2/promise');

const mysql = require('promise-mysql');
const fs = require('fs');

// createTcpPool initializes a TCP connection pool for a Cloud SQL
// instance of MySQL.
const createTcpPool = async config => {
  // Note: Saving credentials in environment variables is convenient, but not
  // secure - consider a more secure solution such as
  // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
  // keep secrets safe.
  const dbConfig = {
    host: '35.224.26.58', // e.g. '127.0.0.1'
    port: '3306', // e.g. '3306'
    user: 'root', // e.g. 'my-db-user'
    password: 'Youwillneverguessthispassword461', // e.g. 'my-db-password'
    database: 'ECE_461_DATABASE', // e.g. 'my-database'
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 60000,
    queueLimit: 0
    // ... Specify additional properties here.
  };
  // Establish a connection to the database.
    console.log('Attempting to create connection pool...');
    try {
        const pool = await mysql.createPool(dbConfig);
        console.log('Connection pool created successfully!');
        return pool;
    } catch (error) {
        console.error('Error creating connection pool:', error);
        throw error;
    }

  //return mysql.createPool(dbConfig);
};


async function deleteTable(table_name) {
    console.log("In delete function");
    const conn = await createTcpPool();
    console.log("after tcp pool is created");
    const connection = await conn.getConnection();
    console.log("Connection acquired");

    try {
      console.log(`In the try statement`);
      const stmt = `DROP TABLE IF EXISTS ${table_name}`;
      await connection.query(stmt);
      console.log(`Table ${table_name} has been deleted.`);

    }catch (error) {
        console.log("There is an error in delete function");
        console.error(error);
    } finally {
      await connection.release();
    }
    console.log("Leaving delete function");

}

async function createRepoTable(engine) {
    const conn = await engine.acquire();
    const stmt = `
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
      )
    `;
    await conn.query(stmt);
    console.log("Table 'repo_info' created successfully.");
    engine.release(conn);
    console.log("RepoTable is created");
}

async function createZipTable(engine) {
    const conn = await engine.acquire();
    const stmt = `
      CREATE TABLE zipped_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_id VARCHAR(255),
        url VARCHAR(255),
        zipped_file LONGBLOB
      )
    `;
    await conn.query(stmt);
    console.log("Table 'zipped_table' created successfully.");
    engine.release(conn);
}

async function insertZippedData(engine, file_id, url, zipped_file) {
    const conn = await engine.acquire();
    const insert_stmt = `
      INSERT INTO zipped_table (file_id, url, zipped_file)
      VALUES (:file_id, :url, :zipped_file)
    `;
    try {
      await conn.query(insert_stmt, [file_id, url, zipped_file]);
      await conn.commit();
    } catch (e) {
      console.error(`Error occurred: ${e}`);
      await conn.rollback();
    } finally {
      engine.release(conn);
    }
}

async function retrieveZippedFile(engine, url) {
    const conn = await engine.acquire();
    const query = `
      SELECT zipped_file FROM zipped_table WHERE url=?
    `;
    try {
      const [rows] = await conn.query(query, [url]);
      if (rows.length > 0) {
        const zipped_file = rows[0].zipped_file;
        return zipped_file;
      } else {
        console.log(`No zipped file found for url ${url}`);
        return null;
      }
    } catch (e) {
      console.error(`Error occurred: ${e}`);
    } finally {
      engine.release(conn);
    }
}

async function insert_repo_data(engine, repo_name, url, total_score, ramp_up_score, correctness_score,
    bus_factor, responsiveness_score, license_score, version_score, adherence_score) {
const conn = await engine.connect();

try {
// Check if a record with the same URL already exists
const check_stmt = `
SELECT EXISTS(
SELECT 1 FROM repo_info WHERE url = :url LIMIT 1
)
`;
const check_result = await conn.execute(check_stmt, { url });

if (check_result.fetchone()[0]) {
throw new Error(`Record with URL ${url} already exists in the database`);
}

// Insert new record into repo_info table
const stmt = `
INSERT INTO repo_info (repo_name, url, total_score, ramp_up_score, correctness_score,
bus_factor, responsiveness_score, license_score, version_score, adherence_score)
VALUES (:repo_name, :url, :total_score, :ramp_up_score, :correctness_score,
:bus_factor, :responsiveness_score, :license_score, :version_score, :adherence_score)
`;
await conn.execute(stmt, {
repo_name,
url,
total_score,
ramp_up_score,
correctness_score,
bus_factor,
responsiveness_score,
license_score,
version_score,
adherence_score,
});

await conn.commit();
console.log("Data inserted successfully.");
} catch (e) {
console.log(`Error occurred: ${e}`);
await conn.rollback();
} finally {
await conn.close();
}
}


async function retrieve_repo_data_url(engine, url) {
    const conn = await engine.connect();
    try {
      const result = await conn.execute(
        "SELECT * FROM repo_info WHERE url=:url", { url: url }
      );
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        return null;
      }
    } catch (error) {
      console.log(`Error occurred: ${error}`);
    } finally {
      await conn.close();
    }
}

//const fs = require('fs');
const path = require('path');

function downloadZippedFile(zippedFile, fileName, downloadPath) {
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
    }

    const filePath = path.join(downloadPath, fileName);

    fs.writeFileSync(filePath, zippedFile);

    console.log(`Zipped file downloaded and saved to ${filePath}`);
}

async function main() {
    // Write the code you want to execute here
    const pool =  await createTcpPool();
    console.log("pool has been created");
    const connection = await pool.getConnection();
    console.log("Connection has been created");
    await deleteTable("repo_info");
    console.log("table has been deleted");


}
  
  // Call your entry point function
  main();
  
  //const pool =  await createTcpPool();
  //await deleteTable("repo_info");
  //console.log("pool has been created");
  

