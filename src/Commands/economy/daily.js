
const { Client, Interaction } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();

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
      let user = await db.get(userKey);

      // Initialize the database key if it doesn't exist
      if (!user) {
        user = {
          balance: Number(0),
          lastDaily: null
        };
        await db.set(userKey, user);
      } else {
        user.balance = Number(user.balance || 0);
      }

      const lastDailyDate = user.lastDaily ? new Date(user.lastDaily).toDateString() : null;
      const currentDate = new Date().toDateString();

      if (lastDailyDate === currentDate) {
        interaction.editReply(
          'You have already collected your dailies today. Come back tomorrow!'
        );
        return;
      }

      user.lastDaily = new Date();
      user.balance = Number(user.balance) + Number(dailyAmount);
      await db.set(userKey, user);

      interaction.editReply(
        `${dailyAmount} was added to your balance. Your new balance is ${user.balance}`
      );
    } catch (error) {
      console.log(`Error with /daily: ${error}`);
      interaction.editReply('There was an error processing your daily reward.');
    }
  },
};
