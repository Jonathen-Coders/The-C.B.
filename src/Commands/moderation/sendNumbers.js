const { ApplicationCommandOptionType, ActivityType } = require('discord.js');

module.exports = {
    name: 'sendnumbers',
    deleted: false,
    description: 'Send 1000 messages with each message containing a unique number',
    options: [
        {
            name: 'channel',
            description: 'The channel to send messages to',
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
    ],
    callback: async (client, interaction) => {
        // Check if the user has the required permissions
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
            return interaction.reply('You do not have permission to use this command.');
        }

        // Get the target channel
        const targetChannel = interaction.options.getChannel('channel');
        if (!targetChannel) {
            return interaction.reply('Invalid channel ID.');
        }

        // Send an initial reply
        await interaction.reply('Sending messages...');
        client.user.setPresence({
            activities: [{ name: `Counting`, type: ActivityType.Watching }],
            status: 'dnd',
        });

        // Send 1000 messages with a delay
        for (let i = 1; i <= 100; i++) {
            setTimeout(async () => {
                await targetChannel.send(i.toString())
                    .catch(err => {
                        console.error(err);
                        interaction.followUp(`An error occurred while sending messages.${err}`);
                        return;
                    });
                console.log(i.toString());
                if (i === 1000) {
                    client.user.setPresence({
                        status: 'online',
                    });
                    interaction.followUp('Successfully sent 100 messages.')
                        .then(msg => {
                            // Automatically delete the success message after 5 seconds
                            msg.delete({ timeout: 5000 });
                        });
                }
            }, i * 1000); // Delay of 1 second
        }
    },
};

