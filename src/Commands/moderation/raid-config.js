
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { db } = require('replit');

module.exports = {
  name: 'raid-config',
  description: 'Configure raid protection settings',
  options: [
    {
      name: 'threshold',
      description: 'Number of joins to trigger raid protection',
      type: ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 3,
      max_value: 20,
    },
    {
      name: 'window',
      description: 'Time window in seconds',
      type: ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 5,
      max_value: 60,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  
  callback: async (client, interaction) => {
    const threshold = interaction.options.getInteger('threshold');
    const window = interaction.options.getInteger('window');
    
    const dbKey = `raidprotection_${interaction.guild.id}`;
    await db.set(dbKey, { threshold, window: window * 1000 });
    
    interaction.reply(`Raid protection configured: ${threshold} joins within ${window} seconds will trigger protection.`);
  },
};
