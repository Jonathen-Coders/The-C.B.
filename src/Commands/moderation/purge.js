
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
// Import the necessary Discord.js modules

module.exports = {
    name: 'bulkdelete',
    description: 'Delete a specified number of messages up to 100',
    deleted: false,
    options: [
        {
            name: 'target',
            description: 'The target of the purge (user, bots, or all)',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'User',
                    value: 'user',
                },
                {
                    name: 'Bots',
                    value: 'bots',
                },
                {
                    name: 'All',
                    value: 'all',
                },
            ],
        },
        {
            name: 'amount',
            description: 'The number of messages to delete',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
        
    ],
    callback: async (client, interaction) => {
        // Check if the user has the required permissions
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
            return interaction.reply('You do not have permission to use this command.');
        }

        // Get the amount and target from the interaction options
        let amount = interaction.options.getInteger('amount');
        const target = interaction.options.getString('target');
        // Send an initial response
        await interaction.reply('Deleting messages...');
        // Check if the amount is a valid number
        if (isNaN(amount) || amount <= 0 || amount > 1000) {
            return interaction.reply('Please provide a valid number between 1 and 1000 for the amount.');
        }

         // Fetch and delete messages in batches of 100
         let deletedMessages = 0;
        while (amount > 0) {
            const fetchAmount = Math.min(amount, 100);
            let fetched;
            if (target === 'user') {
                fetched = await interaction.channel.messages.fetch({ limit: fetchAmount, before: interaction.id, user: interaction.user.id });
            } else if (target === 'bots') {
                fetched = await interaction.channel.messages.fetch({ limit: fetchAmount, before: interaction.id, user: interaction.client.user.id });
            } else {
                fetched = await interaction.channel.messages.fetch({ limit: fetchAmount, before: interaction.id });
            }
            let messagesToDelete = fetched.filter(msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000);

            // Delete the fetched messages
            await interaction.channel.bulkDelete(messagesToDelete)
                .catch(err => {
                    console.error(err);
                    interaction.reply(`An error occurred while deleting messages.${err}`);
                });

                deletedMessages += messagesToDelete.size;
                amount -= fetchAmount;
        }

        // Send a success message
        interaction.editReply(`Successfully deleted ${deletedMessages} messages.`)
            .then(msg => {
                // Automatically delete the success message after 5 seconds
                msg.delete({ timeout: 10000 });
            });
    },
};