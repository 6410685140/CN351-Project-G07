const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index', { output: null });
});

app.post('/execute', (req, res) => {
  const command = req.body.command.trim(); 
  const parameter = req.body.parameter.trim(); 

  const fullCommand = `${command} ${parameter}`;

  exec(fullCommand, (error, stdout, stderr) => {
    if (error) {
      res.render('index', { output: `Error: ${error.message}` });
      return;
    }
    if (stderr) {
      res.render('index', { output: `Stderr: ${stderr}` });
      return;
    }
    res.render('index', { output: stdout });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
