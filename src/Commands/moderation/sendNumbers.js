const { ApplicationCommandOptionType, ActivityType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'sendnumbers',
    description: 'Send numbers to a specified channel and delete them slowly.',
    options: [
        {
            name: 'channel',
            description: 'The channel to send numbers to',
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
    ],
    callback: async (client, interaction) => {
        // Check if the user has the required permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
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

        // Store message IDs to delete later
        const messageIds = [];

        // Send 100 messages with a delay
        for (let i = 1; i <= 100; i++) {
            setTimeout(async () => {
                try {
                    const message = await targetChannel.send(i.toString());
                    messageIds.push(message.id);
                    console.log(i.toString());

                    if (i === 100) {
                        client.user.setPresence({
                            status: 'online',
                        });
                        await interaction.followUp('Successfully sent 100 messages.')
                            .then(msg => {
                                // Automatically delete the success message after 5 seconds
                                setTimeout(() => msg.delete(), 5000);
                            });

                        // Start deleting messages slowly in reverse order
                        deleteMessagesSlowly(targetChannel, messageIds);
                    }
                } catch (err) {
                    console.error(err);
                    interaction.followUp(`An error occurred while sending messages: ${err}`);
                }
            }, i * 1000); // Delay of 1 second
        }
    },
};

// Function to delete messages slowly in reverse order
async function deleteMessagesSlowly(channel, messageIds) {
    for (let i = messageIds.length - 1; i >= 0; i--) {
        setTimeout(async () => {
            try {
                const message = await channel.messages.fetch(messageIds[i]);
                await message.delete();
                console.log(`Deleted message: ${messageIds[i]}`);
            } catch (err) {
                console.error(`Error deleting message ${messageIds[i]}:`, err);
            }
        }, (messageIds.length - i) * 1000); // Delay of 1 second between deletions
    }
}
