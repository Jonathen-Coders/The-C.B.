
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'mathgame',
  description: 'Play a math game solving linear equations (y=mx+b)',
  options: [
    {
      name: 'answer',
      description: 'Your answer to the equation',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
  callback: async (client, interaction) => {
    const answer = interaction.options.getInteger('answer');

    if (!client.mathGame) {
      client.mathGame = {};
    }

    if (!answer) {
      // Generate new equation
      const m = Math.floor(Math.random() * 10) - 5; // -5 to 5
      const b = Math.floor(Math.random() * 10) - 5; // -5 to 5
      const x = Math.floor(Math.random() * 10) - 5; // -5 to 5
      const y = m * x + b;

      client.mathGame[interaction.user.id] = {
        m,
        b,
        x,
        y,
        timestamp: Date.now()
      };

      return interaction.reply(
        `🔢 Solve for y: y = ${m}x + ${b}\nWhat is y when x = ${x}?\n` +
        `Use \`/mathgame answer:<your answer>\` to submit your solution!`
      );
    }

    const userGame = client.mathGame[interaction.user.id];
    
    if (!userGame) {
      return interaction.reply('Start a new game first using `/mathgame`!');
    }

    if (answer === userGame.y) {
      delete client.mathGame[interaction.user.id];
      return interaction.reply('✅ Correct! The answer was ' + userGame.y);
    } else {
      return interaction.reply('❌ Incorrect! Try again or start a new game with `/mathgame`');
    }
  },
};
