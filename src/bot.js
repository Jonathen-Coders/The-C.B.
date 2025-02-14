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

client.login(process.env.TOKEN).catch(console.error);