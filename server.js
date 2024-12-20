
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
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

// CORS configuration for GitHub Pages
app.use(cors({
  origin: 'https://bot-site.joncodingreviews.com',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    maxAge: 60000 * 60 * 24 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Discord Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: 'https://your-repl-url.repl.co/auth/discord/callback',
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// Auth routes
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', 
  passport.authenticate('discord', {
    failureRedirect: '/'
  }),
  (req, res) => res.redirect('https://bot-site.joncodingreviews.com/dashboard')
);

// API endpoints
app.get('/api/stats', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    guilds: client?.guilds.cache.size || 0,
    users: client?.users.cache.size || 0,
    commands: client?.commands?.size || 0
  });
});

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json(req.user);
});

app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect('https://bot-site.joncodingreviews.com');
});

app.listen(80, '0.0.0.0', () => {
  console.log('Server running on port 80');
});
