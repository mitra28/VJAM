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


export async function createMainTable(){
  //console.log("In create Repo function");
  const stmt = `
      CREATE TABLE main_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        version VARCHAR(255),
        name_tag VARCHAR(255),
        repo_id INT,
        score_id INT
      )
    `;
  await pool.query(stmt);
  console.log('Main table was successfully created');
}


export async function creatRepoTable(){
  //console.log("In create Repo function");
  const stmt = `
      CREATE TABLE repo_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(255),
        zip TEXT,
        readme VARCHAR(200)
      )
    `;
  await pool.query(stmt);
  console.log('Repo table was successfully created');
}

export async function creatScoreTable(){
  //console.log("In create Repo function");
  const stmt = `
      CREATE TABLE score_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        total_score FLOAT,
        ramp_up_score FLOAT,
        correctness_score FLOAT,
        bus_factor FLOAT,
        responsiveness_score FLOAT,
        license_score FLOAT,
        version_score FLOAT,
        adherence_score FLOAT)
      )
    `;
  await pool.query(stmt);
  console.log('Repo table was successfully created');
}
export async function insertScoreTable(total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score) {
  const stmt = `INSERT INTO score_table (total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const result = await pool.query(stmt, [total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score]);
  return result.insertId;
}
export async function insertRepoTable(url, zip, readme) {
  const stmt = `INSERT INTO repo_table (url, zip, readme) VALUES (?, ?, ?)`;
  const result = await pool.query(stmt, [url, zip, readme]);
  return result.insertId;
}
export async function insertMainTable(name, version, name_tag, repo_id, score_id) {
  const stmt = `INSERT INTO main_table (name, version, name_tag, repo_id, score_id) VALUES (?, ?, ?, ?, ?)`;
  const result = await pool.query(stmt, [name, version, name_tag, repo_id, score_id]);
  console.log(`Inserted into Main Table: ${name}, ${version}, ${name_tag}, ${repo_id}, ${score_id}`);

}

export async function deleteID(name_tag){
  try {
    const mainQuery = 'SELECT repo_id, score_id FROM main_table WHERE name_tag = ?';
    const [mainResults] = await pool.query(mainQuery, [name_tag]);
    if (mainResults.length === 0) {
      console.log(`No row found in the main_table for name_tag ${name_tag}`);
      return;
    }
    const repoId = mainResults[0].repo_id;
    const scoreId = mainResults[0].score_id;

    // Delete row from main_table
    const deleteMainQuery = 'DELETE FROM main_table WHERE name_tag = ?';
    await pool.query(deleteMainQuery, [name_tag]);

    // Delete row from repo_table
    const deleteRepoQuery = 'DELETE FROM repo_table WHERE id = ?';
    await pool.query(deleteRepoQuery, [repoId]);

    // Delete row from score_table
    const deleteScoreQuery = 'DELETE FROM score_table WHERE id = ?';
    await pool.query(deleteScoreQuery, [scoreId]);

    console.log(`Deleted row with name_tag ${name_tag} from main_table and corresponding rows from repo_table and score_table`);
  } catch (err) {
    console.error(err);
  }
}

export async function deleteTable(table_name) {
    const stmt = `DROP TABLE IF EXISTS ${table_name}`;
    await pool.query(stmt);
    console.log(`Table ${table_name} has been deleted.`);
}

export async function retrieveRepoTable(name_tag) {
  const mainStmt = `SELECT repo_id FROM main_table WHERE name_tag = ?`;
  const [mainRes] = await pool.query(mainStmt, [name_tag]);
  if (mainRes.length === 0) {
    throw new Error(`No rows found for nameTag: ${name_tag}`);
  }
  const repo_id = mainRes[0].repo_id;

  const repoStmt = `SELECT * FROM repo_table WHERE id = ?`;
  const [repoRes] = await pool.query(repoStmt, [repo_id]);
  if (repoRes.length === 0) {
    throw new Error(`No rows found in repo_table for repoID: ${repo_id}`);
  }

  console.log(`Retrieved from Repo Table: ${repoRes[0].url}, ${repoRes[0].zip}, ${repoRes[0].readME}`);
  return repoRes[0];
}

export async function retrieveScoreTable(name_tag) {
  const mainStmt = `SELECT score_id FROM main_table WHERE name_tag = ?`;
  const [mainRes] = await pool.query(mainStmt, [name_tag]);
  if (mainRes.length === 0) {
    throw new Error(`No rows found for nameTag: ${name_tag}`);
  }
  const score_id = mainRes[0].score_id;

  const scoreStmt = `SELECT * FROM score_table WHERE id = ?`;
  const [scoreRes] = await pool.query(scoreStmt, [score_id]);
  if (scoreRes.length === 0) {
    throw new Error(`No rows found in score_table for scoreID: ${score_id}`);
  }

  console.log(`Retrieved from Score Table: ${scoreRes[0].total_score}, ${scoreRes[0].ramp_up_score}, ${scoreRes[0].correctness_score}, ${scoreRes[0].bus_factor}, ${scoreRes[0].responsiveness_score}, ${scoreRes[0].license_score}, ${scoreRes[0].version_score}, ${scoreRes[0].adherence_score}`);
  return scoreRes[0];
}

export async function retrieveMainTable(name_tag) {
  const stmt = `
    SELECT *
    FROM main_table
    WHERE name_tag = ?
  `;
  const result = await pool.query(stmt, [name_tag]);
  return result[0]; // return first row of results
}
export async function retrieveAllTables(name_tag) {

  const repoData = await retrieveRepoTable(name_tag);
  const scoreData = await retrieveScoreTable(name_tag);
  const MainData = await retrieveMainTable(name_tag);
  console.log(`Retrieved data for nameTag: ${name_tag}`);
  console.log(repoData);
  console.log(scoreData);
  console.log(MainData);
}
export async function insertALLTable(name, version, name_tag, url, zip,
  readme, total_score,ramp_up_score,correctness_score,bus_factor,responsiveness_score,
  license_score,version_score,adherence_score){

  const repo_id =  await insertRepoTable(url, zip, readme);
  const score_id = await insertScoreTable(total_score,ramp_up_score,correctness_score,bus_factor,responsiveness_score,license_score,version_score,adherence_score);
  await insertMainTable(name, version, name_tag, repo_id, score_id);
  const get_repo_query = 'SELECT repo_id, score_id FROM main_table WHERE name_tag = ?';
}

//deleteTable("main_table");
deleteTable("main_table");
deleteTable("repo_table");
deleteTable("score_table");
createMainTable();
creatRepoTable();
creatScoreTable();


//createRepoTable();



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

/*
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
*/

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

