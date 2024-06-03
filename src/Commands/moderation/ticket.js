const { ApplicationCommandOptionType } = require('discord.js');
const mongoose = require('mongoose');
const Ticket = require('../../models/Ticket');
module.exports = {
    name: 'ticket',
    description: 'Open a support ticket',
    options: [
        {
            name: 'category',
            description: 'The category for the ticket channel',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'General',
                    value: 'General',
                },
                // Add more categories as needed
            ],
        },
        {
            name: 'reason',
            description: 'Reason for opening the ticket',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Support',
                    value: 'support',
                },
                {
                    name: 'General Inquiry',
                    value: 'general',
                },
                {
                    name: 'Application',
                    value: 'application',
                },
                // Add other reasons as needed
            ],
        },
    ],
    callback: async (client, interaction) => {
        // Get the category and reason from the interaction options
        const category = interaction.options.getString('category');
        const reason = interaction.options.getString('reason');

        // Create a new channel (ticket) in the specified category
        try {
            const ticketChannel = await interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
                type: 'text',
                parent: category, // Set the category
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    },
                    // Add other permission overwrites as needed (e.g., support staff roles)
                ],
            });

            // Create a new ticket document in the database
            const newTicket = new Ticket({
                userId: interaction.user.id,
                channelId: ticketChannel.id,
                reason: reason, // Store the reason
                // Add other relevant data
            });

            // Save the ticket to the database
            await newTicket.save();

            // Send an initial message in the ticket channel
            const initialMessage = await ticketChannel.send(`Welcome to your ${reason} ticket, ${interaction.user}! To close this ticket, click the 🔒 reaction.`);
            await initialMessage.react('🔒'); // Add a checkmark reaction

            // Listen for reaction events
            client.on('messageReactionAdd', async (reaction, user) => {
                if (reaction.emoji.name === '🔒' && user.id !== client.user.id) {
                    // Mark the ticket as closed in the database
                    await Ticket.findOneAndUpdate(
                        { channelId: ticketChannel.id },
                        { status: 'closed' }
                    );

                    // Optionally, send a closing message in the ticket channel
                    await ticketChannel.send('This ticket has been closed. Thank you for reaching out!');
                }
            });

            // Respond to the user
            await interaction.reply(`Your ${reason} ticket has been created in ${ticketChannel}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while creating the ticket.');
        }
    },
};