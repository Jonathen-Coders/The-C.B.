
const { Client, Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { exec } = require('child_process');

module.exports = {
  name: 'uptime',
  description: 'Shows how long the bot has been online',
  deleted: false,
  callback: async (client, interaction) => {
    await interaction.deferReply();
    
    const prettyMs = await import('pretty-ms');
    const uptime = prettyMs.default(client.uptime, { verbose: true });

    // Only add the restart button if not in DMs
    if (interaction.guild) {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('restart_bot')
            .setLabel('Restart & Redeploy')
            .setStyle(ButtonStyle.Danger)
        );

      await interaction.editReply({
        content: `🤖 Bot has been online for: ${uptime}`,
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        time: 15000
      });

      collector.on('collect', async (i) => {
        if (i.customId === 'restart_bot') {
          if (!i.member.permissions.has('Administrator')) {
            await i.reply({ content: 'You do not have permission to restart the bot.', ephemeral: true });
            return;
          }

          await i.reply({ content: '⚠️ Restarting bot and redeploying...', ephemeral: true });
          
          exec('node src/events/ready/01registerCommands.js', async (error) => {
            if (error) {
              console.error('Error registering commands:', error);
              return;
            }
            
            setTimeout(async () => {
              await client.destroy();
              await client.login(process.env.TOKEN);
              await i.editReply('✅ Bot has been restarted and commands redeployed!');
            }, 5000);
          });
        }
      });
    } else {
      // Simple response for DMs without the restart button
      await interaction.editReply({
        content: `🤖 Bot has been online for: ${uptime}`
      });
    }
  },
};
