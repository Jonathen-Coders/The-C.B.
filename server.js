
const express = require('express');
const app = express();

// Replace with your GitHub Pages URL
const GITHUB_PAGES_URL = 'https://bot-site.joncodingreviews.com/';

app.get('/', (req, res) => {
  res.redirect(GITHUB_PAGES_URL);
});

app.get('/status', (req, res) => {
  res.send('Bot is running!');
});

app.listen(80, '0.0.0.0', () => {
  console.log('Server listening on port 80');
});
