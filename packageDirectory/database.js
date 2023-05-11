// const mysql = require('mysql2');
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


export async function createMainTable(){
  console.log("In create Repo function");
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


export async function createRepoTable(){
  console.log("In create Repo Table function");
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

export async function createScoreTable(){
  //console.log("In create Score function");
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
        adherence_score FLOAT
      )
    `;
  await pool.query(stmt);
  console.log('Score table was successfully created');
}

/*
export async function insertMainTable(name, version, name_tag, repo_id, score_id) {
  const stmt = `INSERT INTO main_table (name, version, name_tag, repo_id, score_id) VALUES (?, ?, ?, ?, ?)`;
  const result = await pool.query(stmt, [name, version, name_tag, repo_id, score_id]);
  console.log(`Inserted into Main Table: ${name}, ${version}, ${name_tag}, ${repo_id}, ${score_id}`);
}*/

export async function insertScoreTable(total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score) {
  const stmt = `INSERT INTO score_table (total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await pool.query(stmt, [total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score]);
  return result.insertId;
}
export async function insertRepoTable(url, zip, readme) {
  const stmt = `INSERT INTO repo_table (url, zip, readme) VALUES (?, ?, ?)`;
  const [result] = await pool.query(stmt, [url, zip, readme]);
  return result.insertId;
}

export async function insertMainTable(name, version, name_tag) {
  const checkStmt = `SELECT COUNT(*) as count FROM main_table WHERE name_tag = ?`;
  const [checkResult] = await pool.query(checkStmt, [name_tag]);

  if (checkResult[0].count > 0) {
    //throw new Error(`Entry for ${name_tag} already exists in Main Table`);
    return -1;
  } else {
    const stmt = `INSERT INTO main_table (name, version, name_tag) VALUES (?, ?, ?)`;
    const [result] = await pool.query(stmt, [name, version, name_tag]);
    console.log(`Inserted into Main Table: ${name}, ${version}, ${name_tag}`);
    return result.insertId;
  }
}

export async function insertZippedString(zip){
  const stmt = `INSERT INTO repo_table (zip) VALUES (?)`;
  console.log(stmt);
  const [result] = await pool.query(stmt, [zip]);
  return result.insertId;

}
export async function AddScoreMain(name_tag, score_id){
  const stmt = `UPDATE main_table SET score_id = ? WHERE name_tag = ?`;
  const [result] = await pool.query(stmt, [score_id, name_tag]);
  if (result.affectedRows === 0) {
    throw new Error(`No rows were updated for name tag: ${name_tag}`);
  }
  console.log(`Updated score_id for name tag: ${name_tag} to ${score_id}`);

}

export async function updateMainTableWithRepoScoreIds(mainId, repo_id, score_id) {
  const stmt = `UPDATE main_table SET repo_id = ?, score_id = ? WHERE id = ?`;
  const result = await pool.query(stmt, [repo_id, score_id, mainId]);
  console.log(`Updated Main Table with repo_id=${repo_id} and score_id=${score_id} for id=${mainId}`);
}
export async function insertALLTable(name, version, name_tag, url, zip, readme, total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score) {
  try {
    const mainID = await insertMainTable(name, version, name_tag);
    console.log(mainID);
    if(mainID != -1){
      const repo_id = await insertRepoTable(url, zip, readme);
      console.log(`Repo ID: ${repo_id}`);
      const score_id = await insertScoreTable(total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score);
      console.log(`Score ID: ${score_id}`);
      await updateMainTableWithRepoScoreIds(mainID, repo_id, score_id);
    }
    return mainID; //will be -1 if the entry already exists, will be an actul value from 1-inf if it doesnt
  } catch (err) {
    console.error(err);
  }
}

export async function retrieveMainTableRowByNametag(nametag) {
  const stmt = `SELECT * FROM main_table WHERE name_tag = ?`;
  const [result] = await pool.query(stmt, [nametag]);
  //console.log(result[0]);
  return result[0];
}


export async function deleteID_nametag(name_tag){
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

export async function deleteID_name(name){
  try {
    const mainQuery = 'SELECT repo_id, score_id FROM main_table WHERE name = ?';
    const [mainResults] = await pool.query(mainQuery, [name]);
    if (mainResults.length === 0) {
      console.log(`No row found in the main_table for name_tag ${name}`);
      return;
    }
    const repoId = mainResults[0].repo_id;
    const scoreId = mainResults[0].score_id;

    // Delete row from main_table
    const deleteMainQuery = 'DELETE FROM main_table WHERE name = ?';
    await pool.query(deleteMainQuery, [name]);

    // Delete row from repo_table
    const deleteRepoQuery = 'DELETE FROM repo_table WHERE id = ?';
    await pool.query(deleteRepoQuery, [repoId]);

    // Delete row from score_table
    const deleteScoreQuery = 'DELETE FROM score_table WHERE id = ?';
    await pool.query(deleteScoreQuery, [scoreId]);

    console.log(`Deleted row with name_tag ${name} from main_table and corresponding rows from repo_table and score_table`);
  } catch (err) {
    console.error(err);
  }
}

//retrieve all names matching a regex
export async function retrieveRegEx(regex) {
  const stmt = `SELECT main_table.name, main_table.version
                FROM main_table
                INNER JOIN repo_table
                ON main_table.repo_id = repo_table.id
                WHERE main_table.name REGEXP ?
                OR repo_table.readme REGEXP ?`;
  const [rows] = await pool.query(stmt, [regex, regex]);
  return rows;
}

//retrieve all packages from an offset
export async function retrievePackages(offset) {
  const stmt = `SELECT main_table.name, main_table.version, main_table.name_tag
                FROM main_table
                WHERE id >= ?
                LIMIT 100`;
  const [rows] = await pool.query(stmt, [offset]);
  return rows;
}



export async function deleteTable(table_name) {
  console.log("In delete Table function");
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
  console.log(mainRes);
  const repo_id = mainRes[0].repo_id;

  const repoStmt = `SELECT * FROM repo_table WHERE id = ?`;
  const [repoRes] = await pool.query(repoStmt, [repo_id]);
  if (repoRes.length === 0) {
    throw new Error(`No rows found in repo_table for repoID: ${repo_id}`);
  }

  console.log(`Retrieved from Repo Table: ${repoRes[0].url}, ${repoRes[0].zip}, ${repoRes[0].readME}`);
  return repoRes[0];
}

//retrieve all names
export async function retrieveAllNames() {
  const stmt = `SELECT name FROM main_table`;
  const [rows] = await pool.query(stmt);
  return rows;
}
//retrieve all namesTag
export async function retrieveAllNameTag() {
  const stmt = `SELECT name_tag FROM main_table`;
  const [rows] = await pool.query(stmt);
  return rows;
}

//package get my name
export async function retrieveScoreTable(name_tag) {
  const mainStmt = `SELECT score_id FROM main_table WHERE name_tag = ?`;
  const [mainRes] = await pool.query(mainStmt, [name_tag]);
  if (mainRes.length === 0) {
    //return 404
    // throw new Error(`No rows found for nameTag: ${name_tag}`);
    return -404;
  }
  //we could make this return -1 and if the value returned is -1 we know it doesnt exist in scores
  const score_id = mainRes[0].score_id;

  const scoreStmt = `SELECT * FROM score_table WHERE id = ?`;
  const [scoreRes] = await pool.query(scoreStmt, [score_id]);
  if (scoreRes.length === 0) {
    return -1; // if -1 then rate package
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
  const [result] = await pool.query(stmt, [name_tag]);
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
  return {
    repoData,
    scoreData,
    MainData
  }; //return an object 
}
//post package list
export async function retrieveAllZip(){
  const stmt = `SELECT zip FROM repo_table`;
  const [result] = await pool.query(stmt);
  console.log(result);
}
//put package update using id(name or rowID)
export async function updateZip(name_tag, newZip) {
  const mainStmt = `SELECT repo_id FROM main_table WHERE name_tag = ?`;
  const [mainRes] = await pool.query(mainStmt, [name_tag]);
  if (mainRes.length == 0) {
    throw new Error(`No rows found for nameTag: ${name_tag}`);
  }
  const id = mainRes[0].repo_id;
  const stmt = `UPDATE repo_table SET zip = ? WHERE id = ?`;
  const [result] = await pool.query(stmt, [newZip, id]);
  console.log(`Updated zip for id=${id} in repo_table`);
}
export async function retrieveZippedString(name_tag){
  const mainStmt = `SELECT repo_id FROM main_table WHERE name_tag = ?`;
  const [mainRes] = await pool.query(mainStmt, [name_tag]);
  if (mainRes.length === 0) {
    throw new Error(`No rows found for nameTag: ${name_tag}`);
  }
  const id = mainRes[0].repo_id;

  const stmt = `SELECT zip FROM repo_table WHERE id = ?`;
  const [result] = await pool.query(stmt, [id]);

  if (result.length === 0) {
    throw new Error(`No entry with id ${id} found in repo_table`);
  }
  //console.log(result);
  return result[0].zip;
}

export async function packageCount(name_tag){
  const stmt = "SELECT COUNT(*) AS count FROM main_table WHERE name_tag = ?";
  const [result] = await pool.query(stmt, [name_tag]);
  const count = result[0].count;
  if(count > 0){
    return 1;
  }else{
    return -404;
  }
}


export async function updateScore(name_tag, total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score){
  const mainStmt = `SELECT score_id FROM main_table WHERE name_tag = ?`;
  const [mainRes] = await pool.query(mainStmt, [name_tag]);
  if (mainRes.length == 0) {
    throw new Error(`No rows found for nameTag: ${name_tag}`);
  }
  const id = mainRes[0].score_id;
  const stmt = `UPDATE score_table SET total_score = ?, ramp_up_score = ?, correctness_score = ?, bus_factor = ?, responsiveness_score = ?, license_score = ?, version_score = ?, adherence_score = ? WHERE id = ?`;
  const [result] = await pool.query(stmt, [total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score, id]);
  console.log(`Updated total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score for id=${id} in score_table`);
}



//await createRepoTable();
//const textValue = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(100);
//const id = await insertZippedString(textValue);
//console.log(id);
//const retrievedValue = await retrieveZippedString(4);
//console.log(retrievedValue);
//await deleteTable("repo_table");

/*
await deleteTable("main_table");
await deleteTable("repo_table");
await deleteTable("score_table");

await createMainTable();
await createRepoTable();
await createScoreTable();


await insertALLTable("name", "version", "name_tag", "url", "zip",
  "readme", 0.0,0.1,0.2,0.3,0.4,
  0.5,0.6,0.7);

await insertALLTable("name1", "version1", "name_tag1", "url1", "zip1",
  "readme1", 0.0,0.1,0.2,0.3,0.4,
  0.5,0.6,0.7);
await insertALLTable("name", "version", "name_tag", "url", "zip",
  "readme", 0.0,0.1,0.2,0.3,0.4,
  0.5,0.6,0.7);

await deleteTable("main_table");
await deleteTable("repo_table");
await deleteTable("score_table");*/
//await retrieveAllTables("name_tag");
//await deleteID("name_tag");
//await retrieveAllTables("name_tag");
//await retrieveAllTables("name_tag");




