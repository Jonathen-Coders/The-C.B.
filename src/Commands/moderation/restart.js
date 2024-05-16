require('dotenv').config();
const {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    ActivityType,ClientPresence, 
  } = require('discord.js');
  
  module.exports = {
    deleted: false,
    name: 'rs',
    description: 'Reboots!',
    devOnly: true,
    testOnly: false,
    //options:
   // permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],
  
    callback: async (client, interaction, ClientPresence) => {
     
      interaction.reply("⚠️Restarting...");
      client.user.setPresence({
        activities: [{ name: 'the Console for changes', type: ActivityType.Watching }],
        status: 'dnd',
    });
      setTimeout(async () => {
        await interaction.editReply('✅ the bot has been rebooted!').then(() => {
          client.destroy();
          console.log(`${client.user.tag} Restarted by ${interaction.user.tag} in ${interaction.guild.name}`);
      })
      
        await client.login(process.env.TOKEN).catch((err) => console.log(err));
        console.log(`${client.user.tag} Ready`);
      }, 10000);
          
    },
  };