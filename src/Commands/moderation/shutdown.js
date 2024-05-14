const {
    ApplicationCommandOptionType,
    PermissionFlagsBits,ClientPresence,
    GuildChannel,
  } = require('discord.js');
  
  module.exports = {
    deleted: false,
    name: 'shutdown',
    description: 'Shuts the bot down!',
    devOnly: true,
    testOnly: false,
    //options:
   // permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],
  
    callback: async (client, interaction, ClientPresence) => {
        
        
        interaction.reply("⚠️Shutingdown...");
        await  client.user.setPresence({
          status: "invisible", // You can set it to online, idle, or other statuses
          });
          console.log(`${client.user.tag} Shutdown by ${interaction.user.tag} in ${interaction.guild.name}`);
        setTimeout(async () => {
          await interaction.editReply('✅ the bot has been shutdown!');
          process.exit();
        
        }, 3000);
    },
  };