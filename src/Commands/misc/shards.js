
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'shards',
  description: 'Display information about bot shards',
  callback: async (client, interaction) => {
    if (!client.shard) {
      return interaction.reply('This bot is not sharded.');
    }

    const promises = [
      client.shard.fetchClientValues('guilds.cache.size'),
      client.shard.broadcastEval(c => c.ws.ping)
    ];

    try {
      const [guilds, pings] = await Promise.all(promises);
      const embed = new EmbedBuilder()
        .setTitle('Shard Information')
        .setColor('#00ff00')
        .setTimestamp();

      for (let i = 0; i < client.shard.count; i++) {
        embed.addFields({
          name: `Shard ${i}`,
          value: `Guilds: ${guilds[i]}\nPing: ${pings[i]}ms`,
          inline: true
        });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('Error fetching shard information.');
    }
  },
};
