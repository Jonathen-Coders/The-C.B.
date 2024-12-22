
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'colorroles',
  description: 'Creates a set of color roles for the server',
  permissionsRequired: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const colors = [
      { name: '🔴 Red', color: '#FF0000' },
      { name: '🟢 Green', color: '#00FF00' },
      { name: '🔵 Blue', color: '#0000FF' },
      { name: '💛 Yellow', color: '#FFFF00' },
      { name: '💜 Purple', color: '#800080' },
      { name: '🧡 Orange', color: '#FFA500' },
      { name: '🤎 Brown', color: '#8B4513' },
      { name: '🤍 White', color: '#FFFFFF' },
      { name: '🖤 Black', color: '#000000' },
      { name: '💗 Pink', color: '#FFC0CB' }
    ];

    try {
      const createdRoles = [];
      
      for (const color of colors) {
        // Check if role already exists
        const existingRole = interaction.guild.roles.cache.find(
          (role) => role.name === color.name
        );

        if (!existingRole) {
          const newRole = await interaction.guild.roles.create({
            name: color.name,
            color: color.color,
            reason: 'Color role creation command',
          });
          createdRoles.push(newRole.name);
        }
      }

      if (createdRoles.length > 0) {
        await interaction.editReply(
          `Successfully created the following color roles:\n${createdRoles.join('\n')}`
        );
      } else {
        await interaction.editReply('All color roles already exist!');
      }
    } catch (error) {
      console.error('Error creating color roles:', error);
      await interaction.editReply('There was an error creating the color roles.');
    }
  },
};
