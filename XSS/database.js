const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('data.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS form_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL
  )`);

//   db.run(`INSERT INTO form_data (firstName, lastName) VALUES ('John', 'Doe')`);
//   db.run(`INSERT INTO form_data (firstName, lastName) VALUES ('Jane', 'Doe')`);
});

module.exports = db;
