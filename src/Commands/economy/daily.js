const { Client, Interaction } = require('discord.js');
// const User = require('../../models/User'); // Remove this line
const { db } = require('replit'); // Add this line

const dailyAmount = 1000;

module.exports = {
  name: 'daily',
  deleted: false,
  description: 'Collect your dailies!',
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: 'You can only run this command inside a server.',
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const userKey = `${interaction.guild.id}-${interaction.member.id}`;

      let user = db[userKey];

      if (user) {
        const lastDailyDate = new Date(user.lastDaily).toDateString();
        const currentDate = new Date().toDateString();

        if (lastDailyDate === currentDate) {
          interaction.editReply(
            'You have already collected your dailies today. Come back tomorrow!'
          );
          return;
        }
        
        user.lastDaily = new Date();
      } else {
        user = {
          lastDaily: new Date(),
          balance: 0
        };
      }

      user.balance += dailyAmount;
      db[userKey] = user; // Store the user data back in the Replit database

      interaction.editReply(
        `${dailyAmount} was added to your balance. Your new balance is ${user.balance}`
      );
    } catch (error) {
      console.log(`Error with /daily: ${error}`);
    }
  },
};