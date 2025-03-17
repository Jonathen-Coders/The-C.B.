
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

manager.spawn();
