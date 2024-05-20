const { ApplicationCommandOptionType, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'role',
    deleted: true,//until the next update working in progress
    description: 'Select a role',
    options: [],
    callback: async (client, interaction) => {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('role1')
                    .setLabel('BOT Updates')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('role2')
                    .setLabel('Red')
                    .setStyle('PRIMARY'),
            );

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Select a Role')
            .setDescription('Click a button to select a role.');

        await interaction.reply({ embeds: [embed], components: [row] });

        client.on('interactionCreate', async (buttonInteraction) => {
            if (!buttonInteraction.isButton()) return;

            const { customId, member } = buttonInteraction;

            if (customId === 'role1') {
                const role = buttonInteraction.guild.roles.cache.find(role => role.name === 'Role 1');
                await member.roles.add(role);
            } else if (customId === 'role2') {
                const role = buttonInteraction.guild.roles.cache.find(role => role.name === 'Role 2');
                await member.roles.add(role);
            }

            await buttonInteraction.reply({ content: `You have been given the ${customId} role!`, ephemeral: true });
        });
    },
};
