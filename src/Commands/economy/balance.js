const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');

const { db } = require('replit'); // Add this line

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

    // Check if user exists in Replit database
    const userKey = `${interaction.guild.id}-${targetUserId}`;
    if (!db[userKey]) {
      interaction.editReply(`<@${targetUserId}> doesn't have a profile yet.`);
      return;
    }

    const user = db[userKey]; // Assuming you have user data stored in the database

    interaction.editReply(
      targetUserId === interaction.member.id
        ? `Your balance is **${user.balance}**`
        : `<@${targetUserId}>'s balance is **${user.balance}**`
    );
  },
  deleted: false,
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