
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'bulkdelete',
    description: 'Delete a specified number of messages up to 100',
    deleted: false,
    options: [
        {
            name: 'amount',
            description: 'The number of messages to delete (max 100)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        }
    ],
    callback: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
        }

        const amount = interaction.options.getInteger('amount');
        
        if (amount <= 0 || amount > 100) {
            return interaction.reply({
                content: 'Please provide a number between 1 and 100.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            const filteredMessages = messages.filter(msg => 
                Date.now() - msg.createdTimestamp < 1209600000 // 14 days in milliseconds
            );

            if (filteredMessages.size === 0) {
                return interaction.editReply('No messages found that can be deleted (messages must be under 14 days old).');
            }

            await interaction.channel.bulkDelete(filteredMessages);
            
            return interaction.editReply(`Successfully deleted ${filteredMessages.size} messages.`);
        } catch (error) {
            console.error('Error in bulkdelete:', error);
            return interaction.editReply('Failed to delete messages. Make sure they are not older than 14 days.');
        }
    },
};
