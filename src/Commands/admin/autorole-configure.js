
const { ApplicationCommandOptionType, Client, Interaction, PermissionFlagsBits } = require('discord.js');
const { db } = require('replit');

module.exports = {
  deleted: true,
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }

    const targetRoleId = interaction.options.get('role').value;

    try {
      await interaction.deferReply();
      const dbKey = `autorole_${interaction.guild.id}`;
      
      const existingRole = await db.get(dbKey);
      if (existingRole && existingRole === targetRoleId) {
        interaction.editReply('Auto role has already been configured for that role. To disable run `/autorole-disable`');
        return;
      }

      await db.set(dbKey, targetRoleId);
      interaction.editReply('Autorole has now been configured. To disable run `/autorole-disable`');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'autorole-configure',
  description: 'Configure your auto-role for this server.',
  options: [
    {
      name: 'role',
      description: 'The role you want users to get on join.',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageRoles],
};
