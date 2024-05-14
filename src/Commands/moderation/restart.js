require('dotenv').config();
const {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    ActivityType,ClientPresence, 
  } = require('discord.js');
  
  module.exports = {
    deleted: false,
    name: 'restart',
    description: 'Reboots!',
    devOnly: true,
    testOnly: false,
    //options:
   // permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],
  
    callback: async (client, interaction, ClientPresence) => {
     
      interaction.reply("⚠️Restarting...");
      await  client.user.setPresence({
        status: "invisible", // You can set it to online, idle, or other statuses
        });
      setTimeout(async () => {
        await interaction.editReply('✅ the bot has been rebooted!').then(() => {
          client.destroy();
          console.log(`${client.user.tag} Restarted by ${interaction.user.tag} in ${interaction.guild.name}`);
      })
      
        await client.login(process.env.TOKEN).catch((err) => console.log(err));
        console.log(`${client.user.tag} Ready`);
        await  client.user.setPresence({
          status: "online", // You can set it to online, idle, or other statuses
          });
      }, 5000);
          
    },
  };