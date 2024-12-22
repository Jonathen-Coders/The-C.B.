
const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'colorroles',
  description: 'Creates color roles and generates a selection message',
  permissionsRequired: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const colors = [
      { name: '🔴 Red', color: '#FF0000', emoji: '🔴' },
      { name: '🟢 Green', color: '#00FF00', emoji: '🟢' },
      { name: '🔵 Blue', color: '#0000FF', emoji: '🔵' },
      { name: '💛 Yellow', color: '#FFFF00', emoji: '💛' },
      { name: '💜 Purple', color: '#800080', emoji: '💜' },
      { name: '🧡 Orange', color: '#FFA500', emoji: '🧡' },
      { name: '🤎 Brown', color: '#8B4513', emoji: '🤎' },
      { name: '🤍 White', color: '#FFFFFF', emoji: '🤍' },
      { name: '🖤 Black', color: '#000000', emoji: '🖤' },
      { name: '💗 Pink', color: '#FFC0CB', emoji: '💗' }
    ];

    try {
      const createdRoles = [];
      
      for (const color of colors) {
        const existingRole = interaction.guild.roles.cache.find(
          (role) => role.name === color.name
        );

        if (!existingRole) {
          const newRole = await interaction.guild.roles.create({
            name: color.name,
            color: color.color,
            reason: 'Color role creation command',
          });
          createdRoles.push(newRole);
        }
      }

      // Create color selection message
      const embed = new EmbedBuilder()
        .setTitle('Color Role Selection')
        .setDescription('Click a button to select your color role!')
        .setColor('#2f3136');

      const rows = [];
      let currentRow = new ActionRowBuilder();
      let componentCount = 0;

      colors.forEach((color, index) => {
        const button = new ButtonBuilder()
          .setCustomId(`color_${color.name}`)
          .setLabel(color.name)
          .setStyle(ButtonStyle.Primary)
          .setEmoji(color.emoji);

        currentRow.addComponents(button);
        componentCount++;

        if (componentCount === 5 || index === colors.length - 1) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder();
          componentCount = 0;
        }
      });

      const message = await interaction.channel.send({
        embeds: [embed],
        components: rows
      });

      // Button click handler
      const filter = i => i.customId.startsWith('color_');
      const collector = message.createMessageComponentCollector({ filter });

      collector.on('collect', async i => {
        const colorName = i.customId.replace('color_', '');
        const role = interaction.guild.roles.cache.find(r => r.name === colorName);
        
        const member = i.member;
        const hasRole = member.roles.cache.has(role.id);

        try {
          if (hasRole) {
            await member.roles.remove(role);
            await i.reply({ content: `Removed ${colorName} role!`, ephemeral: true });
          } else {
            // Remove other color roles first
            const colorRoles = member.roles.cache.filter(r => colors.some(c => c.name === r.name));
            await member.roles.remove(colorRoles);
            
            await member.roles.add(role);
            await i.reply({ content: `Added ${colorName} role!`, ephemeral: true });
          }
        } catch (error) {
          await i.reply({ content: 'There was an error changing your role!', ephemeral: true });
        }
      });

      await interaction.editReply(
        createdRoles.length > 0 
          ? `Created ${createdRoles.length} color roles and generated selection message!`
          : 'Color roles already exist! Generated selection message.'
      );
    } catch (error) {
      console.error('Error:', error);
      await interaction.editReply('There was an error setting up the color roles.');
    }
  },
};
