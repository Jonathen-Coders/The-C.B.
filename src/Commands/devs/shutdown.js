const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  deleted: false,
  name: 'sd',
  description: 'Shuts the bot down!',
  devOnly: true,
  testOnly: false,
  options: [
    {
      name: 'passcode',
      description: 'The passcode to shut down the bot',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  botPermissions: [PermissionFlagsBits.Administrator],

  callback: async (client, interaction) => {
    try {
      const providedPasscode = interaction.options.getString('passcode');
      const expectedPasscode = '44'; // Replace with your actual passcode

      if (providedPasscode !== expectedPasscode) {
        return interaction.reply({ content: 'Invalid passcode.', ephemeral: true });
      }

      // Check if the interaction, channel, and user are not null or undefined
      if (interaction && interaction.channel && interaction.user) {
        // Check if the interaction is a direct message
        if (interaction.channel.type === 'DM') {
            // Handle the interaction in a DM
            interaction.reply("⚠️Shutting down...");
            await client.user.setPresence({
                status: "invisible", // You can set it to online, idle, or other statuses
            });
            console.log(`${client.user.tag} Shutdown by ${interaction.user.tag}`);
            setTimeout(async () => {
                await interaction.editReply('✅ The bot has been shut down!');
                process.exit();
            }, 3000);
        } else {
            // Handle the interaction in a guild
            interaction.reply("⚠️Shutting down...");
            await client.user.setPresence({
                status: "invisible", // You can set it to online, idle, or other statuses
            });
            console.log(`${client.user.tag} Shutdown by ${interaction.user.tag} in ${interaction.guild ? interaction.guild.name : 'a guild'}`);
            setTimeout(async () => {
                await interaction.editReply('✅ The bot has been shut down!');
                process.exit();
            }, 3000);
        }
      } else {
        console.log(`One of the objects is null or undefined`);
      }
    } catch (error) {
      console.error(error);
    }
  },
};
