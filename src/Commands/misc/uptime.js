
const { Client, Interaction } = require('discord.js');

module.exports = {
  name: 'uptime',
  description: 'Shows how long the bot has been online',
  deleted: false,
  callback: async (client, interaction) => {
    await interaction.deferReply();
    
    const prettyMs = await import('pretty-ms');
    const uptime = prettyMs.default(client.uptime, { verbose: true });
    
    await interaction.editReply(`🤖 Bot has been online for: ${uptime}`);
  },
};
