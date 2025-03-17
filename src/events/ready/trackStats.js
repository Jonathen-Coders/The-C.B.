
const { db } = require('@replit/database');

module.exports = (client) => {
  // Track message activity
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const key = `stats_messages_${message.guild.id}`;
    const currentCount = await db.get(key) || 0;
    await db.set(key, currentCount + 1);
  });

  // Track command usage
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const key = `stats_commands_${interaction.guild.id}`;
    const currentCount = await db.get(key) || 0;
    await db.set(key, currentCount + 1);
  });

  // Update member counts every 5 minutes
  setInterval(async () => {
    client.guilds.cache.forEach(async (guild) => {
      const key = `stats_members_${guild.id}`;
      await db.set(key, guild.memberCount);
    });
  }, 5 * 60 * 1000);
};
