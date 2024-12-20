const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'senddm',
    description: 'Send a direct message to a specified user.',
    deleted: false,
    options: [
        {
            name: 'user',
            description: 'The user to send the direct message to',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'message',
            description: 'The message to send',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    callback: async (client, interaction) => {
        // Check if the user has the required permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply('You do not have permission to use this command.');
        }

        // Get the target user and message
        const targetUser = interaction.options.getUser('user');
        const message = interaction.options.getString('message');

        if (!targetUser) {
            return interaction.reply('Invalid user ID.');
        }

        // Send the direct message
        await targetUser.send(message);
        await interaction.reply({ content: 'Direct message sent!', ephemeral: true });
    },
};