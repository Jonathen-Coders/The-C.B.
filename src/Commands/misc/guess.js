
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'guess',
  description: 'Guess a number between 1 and 100',
  options: [
    {
      name: 'number',
      description: 'Your guess (1-100)',
      type: ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 1,
      max_value: 100,
    },
  ],
  callback: async (client, interaction) => {
    if (!client.gameNumber) {
      client.gameNumber = Math.floor(Math.random() * 100) + 1;
    }

    const guess = interaction.options.getInteger('number');
    const target = client.gameNumber;

    if (guess === target) {
      client.gameNumber = Math.floor(Math.random() * 100) + 1;
      await interaction.reply(`🎉 Congratulations! ${guess} was correct! A new number has been generated.`);
    } else if (guess < target) {
      await interaction.reply(`Too low! Try a higher number.`);
    } else {
      await interaction.reply(`Too high! Try a lower number.`);
    }
  },
};
