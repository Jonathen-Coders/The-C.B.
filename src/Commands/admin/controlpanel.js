
const { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'controlpanel',
  description: 'Server control panel for administrators',
  deleted: true,
  options: [
    {
      name: 'view',
      description: 'View server statistics and settings',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'reset',
      description: 'Reset server statistics',
      type: ApplicationCommandOptionType.Subcommand,
    }
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],

  callback: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: 'You need Administrator permissions to use this command.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      const embed = new EmbedBuilder()
        .setTitle('Server Control Panel')
        .setColor('#0099ff')
        .addFields(
          { name: 'Members', value: interaction.guild.memberCount.toString() },
          { name: 'Channels', value: interaction.guild.channels.cache.size.toString() },
          { name: 'Roles', value: interaction.guild.roles.cache.size.toString() }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'reset') {
      return interaction.reply({
        content: 'Statistics have been reset.',
        ephemeral: true
      });
    }
  }
};
