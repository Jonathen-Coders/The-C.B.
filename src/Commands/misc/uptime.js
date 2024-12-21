
const { Client, Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'uptime',
  description: 'Shows how long the bot has been online',
  deleted: false,
  callback: async (client, interaction) => {
    await interaction.deferReply();
    
    const prettyMs = await import('pretty-ms');
    const uptime = prettyMs.default(client.uptime, { verbose: true });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('restart_bot')
          .setLabel('Restart Bot')
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.editReply({
      content: `🤖 Bot has been online for: ${uptime}`,
      components: [row]
    });

    // Create button collector
    const collector = interaction.channel.createMessageComponentCollector({
      time: 15000 // Button will be active for 15 seconds
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'restart_bot') {
        // Check if user has permission (bot owner or admin)
        if (!i.member.permissions.has('Administrator')) {
          await i.reply({ content: 'You do not have permission to restart the bot.', ephemeral: true });
          return;
        }

        await i.reply({ content: '⚠️ Restarting bot...', ephemeral: true });
        
        setTimeout(async () => {
          await client.destroy();
          await client.login(process.env.TOKEN);
          await i.editReply('✅ Bot has been restarted!');
        }, 5000);
      }
    });
  },
};
