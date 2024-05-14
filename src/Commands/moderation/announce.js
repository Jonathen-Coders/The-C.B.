const { ApplicationCommandOptionType, Permissions } = require('discord.js');

module.exports = {
    name: 'announce',
    deleted:"true",
    description: 'Announce in any channel',
    options: [
        {
            name: 'title',
            description: 'The title of the announcement', // Adjusted description
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'text',
            description: 'Description of the announcement', // Adjusted description
            type: ApplicationCommandOptionType.STRING,
            required: true,
        },
        {
            name: 'channel',
            description: 'The channel where you want to send the message',
            type: ApplicationCommandOptionType.CHANNEL,
            required: true,
        },
    ],
    permissionsRequired: ['ADMINISTRATOR'],
    botPermissions: ['ADMINISTRATOR'],
    callback: async (client, interaction) => {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: `You don't have permission to create an announcement!`, ephemeral: true });
        }
        
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('text');
        if (description.length > 100) {
            description = description.substring(0, 100); // Truncate to 100 characters
        } else( interaction.reply('sorry please fix this your discription must be less than 100'));
        const embed = {
            color: 'BLUE',
            title: title,
            description: description,
        };

        try {
            await channel.send({ content: `@everyone`, embeds: [embed] });
            await interaction.reply({ content: `👌 Successfully posted the announcement in #${channel}!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply(`There was an issue posting the announcement in ${channel}!`);
        }
    },
};
