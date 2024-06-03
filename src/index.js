require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');
const Ticket = require('./models/Ticket'); // Adjust the path

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.MessageContent,
    ],
});

(async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        // Retrieve existing tickets from the database
        const existingTickets = await Ticket.find({});

        // Listen for reaction events
        client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.emoji.name === '🔒' && user.id !== client.user.id) {
                // Find the corresponding ticket in the database
                const ticket = existingTickets.find((t) => t.channelId === reaction.message.channel.id);
                if (ticket) {
                    // Mark the ticket as closed in the database
                    await Ticket.findOneAndUpdate(
                        { channelId: ticket.channelId },
                        { status: 'closed' }
                    );

                    // Optionally, send a closing message in the ticket channel
                    await reaction.message.channel.send('This ticket has been closed. Thank you for reaching out!');
                }
            }
        });

        // Start listening for other events
        eventHandler(client);

        // Log in with your bot token
        client.login(process.env.TOKEN);
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();
