
const { ShardingManager } = require('discord.js');
require('dotenv').config();

// Create sharding manager
const manager = new ShardingManager('./src/bot.js', {
  token: process.env.TOKEN,
  totalShards: 'auto',
  respawn: true,
});

// Shard events
manager.on('shardCreate', (shard) => {
  console.log(`Launched shard ${shard.id}`);
});

// Initialize Express server
const app = require('./server');
app.listen(8080, '0.0.0.0', () => {
  console.log('Server running on port 8080');
});

manager.spawn();
