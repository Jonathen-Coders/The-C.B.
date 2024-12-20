
const express = require('express');
const app = express();

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// Basic status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime()
  });
});

app.listen(80, '0.0.0.0', () => {
  console.log('Server running on port 80');
});
