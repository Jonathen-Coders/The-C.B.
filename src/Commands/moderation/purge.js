
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
// Import the necessary Discord.js modules

module.exports = {
    name: 'purge',
    description: 'Delete a specified number of messages up to 100',
<<<<<<< HEAD
    deleted: false,
=======
>>>>>>> ec11c95da94a0b422b0f6e337625de8172f80c43
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
        const amount = interaction.options.getInteger('amount');
        const target = interaction.options.getString('target');

        // Check if the amount is a valid number
        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return interaction.reply('Please provide a valid number between 1 and 100 for the amount.');
        }

        // Fetch the specified number of messages
        let fetched;
        let fetchAmount = Math.min(amount, 99) + 1; // Ensure the fetch amount is within the limit
        if (target === 'user') {
            fetched = await interaction.channel.messages.fetch({ limit: fetchAmount, before: interaction.id, user: interaction.user.id });
        } else if (target === 'bots') {
            fetched = await interaction.channel.messages.fetch({ limit: fetchAmount, before: interaction.id, user: interaction.client.user.id });
        } else {
            fetched = await interaction.channel.messages.fetch({ limit: fetchAmount, before: interaction.id });
        }
        let messagesToDelete = fetched.filter(msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000);

// Delete the fetched messages
interaction.channel.bulkDelete(messagesToDelete)
    .then(() => {
        // Send a success message
        interaction.reply(`Successfully deleted ${messagesToDelete.size} messages.`)
            .then(msg => {
                // Automatically delete the success message after 5 seconds
                msg.delete({ timeout: 5000 });
            });
    })
    .catch(err => {
        console.error(err);
                interaction.reply(`An error occurred while deleting messages.${err}`);
            });
    },
};