
const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
