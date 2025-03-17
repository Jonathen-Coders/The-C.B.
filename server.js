
const express = require('express');
const path = require('path');
const minecraftManager = require('./src/utils/minecraftManager');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'src/public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime()
  });
});

// Minecraft status endpoint
app.get('/mc/status', (req, res) => {
  res.json({
    connected: minecraftManager.isConnected(),
    serverInfo: minecraftManager.getServerInfo()
  });
});

module.exports = app;
