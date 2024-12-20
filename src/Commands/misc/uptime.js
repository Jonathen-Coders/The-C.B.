
const { Client, Interaction } = require('discord.js');
const prettyMs = require('pretty-ms');

module.exports = {
  name: 'uptime',
  description: 'Shows how long the bot has been online',
  deleted: false,
  callback: async (client, interaction) => {
    await interaction.deferReply();
    
    const uptime = prettyMs(client.uptime, { verbose: true });
    
    await interaction.editReply(`🤖 Bot has been online for: ${uptime}`);
  },
};
