
const express = require('express');
const path = require('path');
const minecraftManager = require('./src/utils/minecraftManager');
const app = express();

// Module state storage
const moduleStates = {
    minecraft: true,
    voice: true,
    automod: true
};

// Middleware to check owner
const checkOwner = (req, res, next) => {
    const userId = req.headers['x-replit-user-id'];
    if (userId === process.env.OWNER_ID) {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized' });
    }
};

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

// Auth check endpoint
app.get('/auth/check', (req, res) => {
    res.json({ userId: req.headers['x-replit-user-id'] });
});

// Module status endpoint
app.get('/modules/status', checkOwner, (req, res) => {
    res.json(moduleStates);
});

// Module toggle endpoint
app.post('/modules/toggle', checkOwner, express.json(), (req, res) => {
    const { module } = req.body;
    if (module in moduleStates) {
        moduleStates[module] = !moduleStates[module];
        res.json({ success: true, state: moduleStates[module] });
    } else {
        res.status(400).json({ error: 'Invalid module' });
    }
});

module.exports = app;
