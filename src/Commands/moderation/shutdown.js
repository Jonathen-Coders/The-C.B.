const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ClientPresence,
  GuildChannel,
} = require('discord.js');

module.exports = {
  deleted: false,
  name: 'sd',
  description: 'Shuts the bot down!',
  devOnly: true,
  testOnly: false,
  //options:
 // permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.Administrator],

  callback: async (client, interaction, ClientPresence) => {
    try {
      // Check if the interaction, channel, and user are not null or undefined
      if (interaction && interaction.channel && interaction.user) {
        // Check if the interaction is a direct message
        if (interaction.channel.type === 'DM') {
            // Handle the interaction in a DM
            interaction.reply("⚠️Shutingdown...");
            await client.user.setPresence({
                status: "invisible", // You can set it to online, idle, or other statuses
            });
            console.log(`${client.user.tag} Shutdown by ${interaction.user.tag}`);
            setTimeout(async () => {
                await interaction.editReply('✅ the bot has been shutdown!');
                process.exit();
            }, 3000);
        } else {
            // Handle the interaction in a guild
            interaction.reply("⚠️Shutingdown...");
            await client.user.setPresence({
                status: "invisible", // You can set it to online, idle, or other statuses
            });
            console.log(`${client.user.tag} Shutdown by ${interaction.user.tag} in ${interaction.guild ? interaction.guild.name : 'a guild'}`);
            setTimeout(async () => {
                await interaction.editReply('✅ the bot has been shutdown!');
                process.exit();
            }, 3000);
        }
      } else {
        console.log(`One of the objects is null or undefined`);
      }
    } catch (error) {
      console.error(error);
    }
  }, // Add a closing curly brace here
};
