const { ApplicationCommandOptionType, ActivityType } = require('discord.js');

module.exports = {
    name: 'activity',
    description: 'Sets the bot\'s presence',
    devOnly: true,
    options: [
        {
            name: 'status',
            description: 'The status',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Online',
                    value: 'online',
                },
                {
                    name: 'Idle',
                    value: 'idle',
                },
                {
                    name: 'Do Not Disturb',
                    value: 'dnd',
                },
            ],
        },
        {
            name: 'activity',
            description: 'The activity type (PLAYING, WATCHING, LISTENING, STREAMING, COMPETING)',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Playing',
                    value: 'PLAYING',
                },
                {
                    name: 'Watching',
                    value: 'WATCHING',
                },
                {
                    name: 'Listening',
                    value: 'LISTENING',
                },
                {
                    name: 'Streaming',
                    value: 'STREAMING',
                },
                {
                    name: 'Competing',
                    value: 'COMPETING',
                },
            ],
        },
        {
            name: 'message',
            description: 'The status message',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    callback: async (client, interaction) => {
        try {
            // Check if the user has the necessary role
            const requiredRole = 'Bot Owner'; // Replace with the name of the role that should have access to this command
            if (!interaction.member.roles.cache.some(role => role.name === requiredRole)|| !this.devOnly) {
                return interaction.reply('You do not have permission to use this command.');
            }

            // Get the status, activity type, and status message from the command options
            const status = interaction.options.getString('status').toLowerCase();
            const activityType = interaction.options.getString('activity').toUpperCase();
            const statusMessage = interaction.options.getString('message');

            // Set the bot's presence
            await client.user.setPresence({
                activities: [
                    {
                        name: statusMessage,
                        type: ActivityType[activityType] || activityType,
                    },
                ],
                status: status,  // online, idle, or dnd
            });

            interaction.reply({content:`Bot's presence set to: ${status} - ${activityType} ${statusMessage}`, ephemeral: true });
            console.log(`Bot's presence set to: ${status} - ${activityType} ${statusMessage}`);
            
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while setting the presence.');
        }
    },
};
