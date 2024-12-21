
const { Client, Interaction, PermissionFlagsBits } = require('discord.js');
const { db } = require('replit');

module.exports = {
  deleted: true,
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      const dbKey = `autorole_${interaction.guild.id}`;
      const existingRole = await db.get(dbKey);
      
      if (!existingRole) {
        interaction.editReply('Auto role has not been configured for this server. Use `/autorole-configure` to set it up.');
        return;
      }

      await db.delete(dbKey);
      interaction.editReply('Auto role has been disabled for this server. Use `/autorole-configure` to set it up again.');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'autorole-disable',
  description: 'Disable auto-role in this server.',
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
