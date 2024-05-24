import mysql from "mysql";
import  dotenv from "dotenv";
dotenv.config();

// Create a connection to the MySQL server

const connection = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
});

connection.query(`SHOW TABLES LIKE 'userSessions'`, (err, result) => {
  if (err) throw err;
  if (result.length === 0) {
    // Table doesn't exist, create it
    connection.query(`
      CREATE TABLE IF NOT EXISTS userSessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        numberOfTimesLoggedIn INT DEFAULT 0,
        LastLogin DATETIME DEFAULT NULL,
        activity TEXT
      )
    `, (err) => {
      if (err) throw err;
      console.log('userSessions table created');
    });
  } else {
    console.log('userSessions table already exists');
  }
});

export const connectMySql = async function () {
  try {
    console.log('Connecting to MySQL server...');
    // No need to call connection.connect() as connection pool is already created
    console.log('Connected to MySQL server');
  } catch (err) {
    console.error('Error connecting to MySQL server:', err);
  }
}

export const dataToFetch = async function (cb) {
  try {
    connection.query('SELECT * FROM userSessions', (err, rows) => {
      // console.log(rows);
      if (err) {
        console.error('Error executing query: ' + err.stack);
        cb(err, null);
        return;
      }
      console.log('Data retrieved from userSessions table:');
      cb(null, rows);
      return;
    });
  } catch (err) {
    console.log('Error in dataToFetch:', err);
  }
}

export const dataToInsert = async function (UserSessionForUser) {
  try{
    const data = { firstName: UserSessionForUser.firstName, numberOfTimesLoggedIn: UserSessionForUser.numberOfTimesLoggedIn, LastLogin: UserSessionForUser.lastLogin, activity: UserSessionForUser.activity };
    // console.log("this is console under datatoinsert .......   " + JSON.stringify(UserSessionForUser) + "the data is " + JSON.stringify(data));
    connection.query('INSERT INTO userSessions SET?', data, (err, rows) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        return;
      }
      console.log('Data inserted into  MySQL server:');
      // console.log(rows);
    });
  }catch (err) {
    console.error('Error executing query:', err);
  }
}