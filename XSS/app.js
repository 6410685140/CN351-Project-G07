const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const sqlite3 = require('sqlite3').verbose();
const port = 3000;

const db = new sqlite3.Database('data.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS form_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL
    )`);
});

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parsedUrl.pathname === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile('index.html', (error, data) => {
            if (error) {
                res.writeHead(404);
                res.write('Error File not Found');
            } else {
                res.write(data);
            }
            res.end();
        });
    } else if (req.method === 'POST' && parsedUrl.pathname === '/upload') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const postData = querystring.parse(body);
            const firstName = postData.firstName;
            const lastName = postData.lastName;
    
            db.run(`INSERT INTO form_data (firstName, lastName) VALUES (?, ?)`, [firstName, lastName], function(err) {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.write('Database error');
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write('<script>alert("Data saved successfully");</script>');
                }
                res.end();
              });
        });
    } else if (req.method === 'GET' && parsedUrl.pathname === '/view') {
        db.all('SELECT * FROM form_data', (err, rows) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write('Database error');
                res.end();
                return;
            }

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<html><body><h1>Form Data</h1><table border="1"><tr><th>ID</th><th>First Name</th><th>Last Name</th></tr>');
            
            rows.forEach(row => {
                res.write(`<tr><td>${row.id}</td><td>${row.firstName}</td><td>${row.lastName}</td></tr>`);
            });

            res.write('</table></body></html>');
            res.end();
        });
    } else {
        
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('Not Found');
        res.end();
    }
});

server.listen(port, error => {
    if (error) {
        console.log('Something went wrong', error);
    } else {
        console.log('Server is running on port ' + port);
    }
});
