require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const { replit } = require('replit'); // Import the replit package

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  // Your message handling logic here
});

// Start the server on the specified port
replit.start({
  port: 8080, // Replace with the port you configured in your .replit file
  onListen: () => {
    console.log(`Server listening on port 8080`);
  },
});

(async () => {
  try {
    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();