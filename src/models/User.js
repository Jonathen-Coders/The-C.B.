const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  lastDaily: {
    type: Date,
    required: true,
  },
  selectedJob: {
    type: String, // Adjust the data type as needed (e.g., String, Enum, etc.)
},
jobPayouts: {
  type: Map, // Use a Map to store job payouts
  of: Number, // Payouts are numeric (coins)
  default: new Map([
    ['miner', 36], // Payout for mining job
    ['builder', 25], // Payout for builder job
    ['pizza_delivery', 20], // Payout for pizza delivery job
    // Add other jobs as needed
]), // Initialize as an empty object
},
});

module.exports = model('User', userSchema);
