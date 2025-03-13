
const { ApplicationCommandOptionType, ActivityType } = require('discord.js');

module.exports = {
    devOnly: true,
    name: 'presence',
    description: 'Sets the bot\'s presence.',
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
                {
                    name: 'Invisible',
                    value: 'invisible',
                }
            ],
        },
        {
            name: 'activity',
            description: 'The activity type',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Playing',
                    value: 'Playing',
                },
                {
                    name: 'Watching',
                    value: 'Watching',
                },
                {
                    name: 'Listening',
                    value: 'Listening',
                },
                {
                    name: 'Streaming',
                    value: 'Streaming',
                },
                {
                    name: 'Competing',
                    value: 'Competing',
                }
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
            // Get the status, activity type, and status message from the command options
            const status = interaction.options.getString('status');
            const activityType = interaction.options.getString('activity');
            const statusMessage = interaction.options.getString('message');

            // Set the bot's presence
            await client.user.setPresence({
                activities: [
                    {
                        name: statusMessage,
                        type: ActivityType[activityType],
                    },
                ],
                status: status.toLowerCase(),  // online, idle, dnd, or invisible
            });

            await interaction.reply({
                content: `✅ Bot's presence set to: ${status} - ${activityType} ${statusMessage}`, 
                ephemeral: true 
            });
            console.log(`Bot's presence set to: ${status} - ${activityType} ${statusMessage}`);
            
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while setting the presence: ' + error.message,
                ephemeral: true
            });
        }
    },
};
