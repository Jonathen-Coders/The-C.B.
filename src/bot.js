require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const minecraftManager = require('./utils/minecraftManager');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

eventHandler(client);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Handle mentions
  const botMention = `<@${client.user.id}>`;
  if (message.content.startsWith(botMention)) {
    const args = message.content.slice(botMention.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands?.find(cmd => cmd.name === commandName);
    if (!command) return;

    try {
      // Create a fake interaction object
      const fakeInteraction = {
        reply: (content) => message.reply(content),
        deferReply: async () => message.channel.sendTyping(),
        editReply: (content) => message.reply(content),
        guild: message.guild,
        member: message.member,
        channel: message.channel,
        options: {
          get: () => null,
          getString: () => null,
          getUser: () => null,
          getMember: () => null
        }
      };

      await command.callback(client, fakeInteraction);
    } catch (error) {
      console.error(error);
      message.reply('There was an error executing that command.');
    }
  }
});

// Set up Minecraft manager event listeners
minecraftManager.on('connect', ({ host, port }) => {
  console.log(`Minecraft Manager connected to ${host}:${port}`);
});

minecraftManager.on('disconnect', () => {
  console.log('Minecraft Manager disconnected');
});

minecraftManager.on('error', (error) => {
  console.error('Minecraft Manager error:', error);
});

minecraftManager.on('heartbeat', async (data) => {
  // Optional: Log the heartbeat or do something with it
  // console.log(`Minecraft heartbeat: ${data.content}`);
  
  // If you want to send it to a specific channel:
  const logChannelId = process.env.MC_LOG_CHANNEL;
  if (logChannelId) {
    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel && data.content.includes('joined the game')) {
      await logChannel.send(`📝 **Minecraft Log:** ${data.content}`);
    }
  }
});

client.login(process.env.TOKEN).catch(console.error);