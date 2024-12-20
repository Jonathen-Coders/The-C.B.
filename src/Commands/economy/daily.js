
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

      if (!user) {
        user = {
          balance: 0,
          lastDaily: null
        };
      }

      const currentDate = new Date();
      const lastDaily = user.lastDaily ? new Date(user.lastDaily) : null;

      if (lastDaily && lastDaily.toDateString() === currentDate.toDateString()) {
        await interaction.editReply('You have already collected your dailies today. Come back tomorrow!');
        return;
      }

      const newBalance = (Number(user.balance) || 0) + dailyAmount;
      
      await db.set(userKey, {
        balance: newBalance,
        lastDaily: currentDate.toString()
      });

      await interaction.editReply(`${dailyAmount} was added to your balance. Your new balance is ${newBalance}`);
    } catch (error) {
      console.error(`Error with /daily:`, error);
      await interaction.editReply('There was an error processing your daily reward.');
    }
  },
};
