
const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();

module.exports = {
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

    const targetUserId = interaction.options.get('user')?.value || interaction.member.id;

    await interaction.deferReply();

    try {
      const userKey = `${interaction.guild.id}-${targetUserId}`;
      const user = await db.get(userKey);

      if (!user) {
        user = {
          balance: Number(0),
          lastDaily: null
        };
        await db.set(userKey, user);
      } else {
        user.balance = Number(user.balance || 0);
      }

      await interaction.editReply(
        targetUserId === interaction.member.id
          ? `Your balance is **${user.balance}**`
          : `<@${targetUserId}>'s balance is **${user.balance}**`
      );
    } catch (error) {
      await interaction.editReply('There was an error fetching the balance.');
    }
  },
  deleted: true,
  name: 'balance',
  description: "See yours/someone else's balance",
  options: [
    {
      name: 'user',
      description: 'The user whose balance you want to get.',
      type: ApplicationCommandOptionType.User,
    },
  ],
};
