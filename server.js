
const express = require('express');
const app = express();
const port = 8080;

// Replace with your GitHub Pages URL
const GITHUB_PAGES_URL = 'https://yourusername.github.io/your-repo-name';

app.get('/', (req, res) => {
  res.redirect(GITHUB_PAGES_URL);
});

app.get('/status', (req, res) => {
  res.send('Bot is running!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
