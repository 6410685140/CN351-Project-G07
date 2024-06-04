const express = require('express');
const app = express();
const port = 5555;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/attacker.html');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
