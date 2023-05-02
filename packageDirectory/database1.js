import mysql from 'mysql2';

// const connection = mysql.createConnection({
//   host: '35.224.26.58',
//   user: 'root',
//   password: 'Youwillneverguessthispassword461',
//   database: 'ECE_461_DATABASE'
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected to database.');

//   // create a new table in the database
//   const sql = 'CREATE TABLE customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255))';
//   connection.query(sql, (err, result) => {
//     if (err) throw err;
//     console.log('Table created successfully.');
//     // close the connection
//     connection.end();
//   });
// });


const pool = mysql.createPool({
    host: '35.224.26.58',
    user: 'root',
    password: 'Youwillneverguessthispassword461',
    database: 'ECE_461_DATABASE',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }).promise();

  /*
  const result = await pool.query("SELECT * FROM repo_info");
  const row = result[0][0];
  console.log(row);*/

  // CREATE TABLE repo_info (
  //   id INT AUTO_INCREMENT PRIMARY KEY,
  //   repo_name VARCHAR(255),
  //   url VARCHAR(255),
  //   total_score FLOAT,
  //   ramp_up_score FLOAT,
  //   correctness_score FLOAT,
  //   bus_factor FLOAT,
  //   responsiveness_score FLOAT,
  //   license_score FLOAT,
  //   version_score FLOAT,
  //   adherence_score FLOAT)


export async function createRepoTable(){
  //console.log("In create Repo function");
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
        adherence_score FLOAT,
        zip_id FLOAT,
      )
    `;
  await pool.query(stmt);
  console.log('Repo table was successfully created');
}


export async function deleteTable(table_name) {
    const stmt = `DROP TABLE IF EXISTS ${table_name}`;
    await pool.query(stmt);
    console.log(`Table ${table_name} has been deleted.`);
}

export async function createZipTable() {
    const stmt = `
      CREATE TABLE zipped_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_id VARCHAR(255),
        url VARCHAR(255),
        zipped_file LONGBLOB
      )
    `;
    await pool.query(stmt);
    console.log("Table 'zipped_table' created successfully.");
}

export async function insertZippedData(file_id, url, zipped_file) {
    const insert_stmt = `
      INSERT INTO zipped_table SET (file_id, url, zipped_file)
      VALUES (:file_id, :url, :zipped_file)
    `;
    await pool.query(insert_stmt, {file_id, url, zipped_file});
    await pool.commit();
}

export async function retrieveZippedFile(url) {
    const query = `
      SELECT zipped_file FROM zipped_table WHERE url=?
    `;

    const [rows] = await pool.query(query, [url]);
    if (rows.length > 0) {
        const zipped_file = rows[0].zipped_file;
        return zipped_file;
    } else {
        console.log(`No zipped file found for url ${url}`);
        return null;
    }
}


     /*
        const check_stmt = `
        SELECT EXISTS(
        SELECT 1 FROM repo_info WHERE url = :url LIMIT 1
        )
        `;
        const check_result = await pool.query(check_stmt, { url });
        if (check_result && check_result[0] && check_result[0][0]) {
        throw new Error(`Record with URL ${url} already exists in the database`);
        }
        
        // Insert new record into repo_info table
        const stmt = `
        INSERT INTO repo_info (repo_name, url, total_score, ramp_up_score, correctness_score,
        bus_factor, responsiveness_score, license_score, version_score, adherence_score)
        VALUES (:repo_name, :url, :total_score, :ramp_up_score, :correctness_score,
        :bus_factor, :responsiveness_score, :license_score, :version_score, :adherence_score)
        `;
        await pool.query(stmt, {
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
        console.log("Data inserted successfully.");
        */


export async function insert_repo_data(repo_name, url, total_score, ramp_up_score, correctness_score,
    bus_factor, responsiveness_score, license_score, version_score, adherence_score) {

        const result = await pool.query(
          'INSERT INTO repo_info (repo_name, url, total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [repo_name, url, total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score]
        );
        console.log("DATA was inserted");
}

async function retrieve_repo_data_url(url) {
    const result = await pool.query(
        "SELECT * FROM repo_info WHERE url=:url", { url: url }
    );
    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }

    //return result[0];
}


export async function retrieve_repo_data(){
  const [result] = await pool.query("SELECT * FROM repo_info");
  return result;
}

const output = await retrieve_repo_data();
console.log(output[0].bus_factor);

//deleteTable("repo_info");
//createRepoTable();
//insert_repo_data("my_repo", "https://github.com/LMAO", 0.8, 0.7, 0.9, 0.6, 0.85, 0.9, 0.75, 0.8);
//console.log(result);
/*
if (result) {
  console.log('Result:', result);
} else {
  console.log(`No repo found with URL: ${url}`);
}
const repoData = await retrieve_repo_data();
if (repoData) {
  console.log(repoData.rows);
} else {
  console.log("No repo data found");
}*/
//deleteTable("repo_info");

//createZipTable();
//deleteTable("zipped_table");