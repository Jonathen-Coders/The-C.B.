const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'sendnotification',
    description: 'Send a notification to a specified channel.',
    deleted: true,
    options: [
        {
            name: 'channel',
            description: 'The channel to send the notification to',
            type: ApplicationCommandOptionType.Channel,
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

        // Get the target channel and message
        const targetChannel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        if (!targetChannel) {
            return interaction.reply('Invalid channel ID.');
        }

        // Send the notification
        await targetChannel.send(message);
        await interaction.reply({ content: 'Notification sent!', ephemeral: true });
    },
};