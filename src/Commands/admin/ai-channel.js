
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { db } = require('replit');

module.exports = {
  name: 'ai-channel',
  description: 'Configure the AI chatbot channel for this server.',
  options: [
    {
      name: 'set',
      description: 'Set this channel as the AI chatbot channel.',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'disable',
      description: 'Disable the AI chatbot for this server.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const dbKey = `aichannel_${interaction.guild.id}`;

    await interaction.deferReply({ ephemeral: true });

    if (subcommand === 'set') {
      await db.set(dbKey, interaction.channel.id);
      interaction.editReply(
        `✅ AI chatbot is now active in ${interaction.channel}! Members can chat with the AI directly in that channel.`
      );
    } else if (subcommand === 'disable') {
      const existing = await db.get(dbKey);
      if (!existing) {
        interaction.editReply('The AI chatbot is not currently configured for this server.');
        return;
      }
      await db.delete(dbKey);
      interaction.editReply('✅ AI chatbot has been disabled for this server.');
    }
  },
};
