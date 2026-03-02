const { incrementStat, setStat } = require('../../utils/mysql');

module.exports = (client) => {
  // Track message activity
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    try {
      await incrementStat(message.guild.id, 'messages');
    } catch (err) {
      console.error('[trackStats] Failed to track message:', err.message);
    }
  });

  // Track command usage
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || !interaction.guild) return;
    try {
      await incrementStat(interaction.guild.id, 'commands');
    } catch (err) {
      console.error('[trackStats] Failed to track command:', err.message);
    }
  });

  // Update member counts every 5 minutes
  setInterval(async () => {
    for (const guild of client.guilds.cache.values()) {
      try {
        await setStat(guild.id, 'members', guild.memberCount);
      } catch (err) {
        console.error(`[trackStats] Failed to update member count for ${guild.id}:`, err.message);
      }
    }
  }, 5 * 60 * 1000);
};
