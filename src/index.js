
require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandler(client);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  // Your message handling logic here
});

// Initialize Express server
const server = require('../server');

(async () => {
  try {
    await client.login(process.env.TOKEN);
    console.log('Bot is online!');
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();
