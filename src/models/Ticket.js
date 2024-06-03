const mongoose = require('mongoose');

// Import the necessary modules

// Define the ticket schema
const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Closed'],
        default: 'Open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the ticket model
const Ticket = mongoose.model('Ticket', ticketSchema);

// Export the model
module.exports = Ticket;