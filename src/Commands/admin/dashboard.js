
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'dashboard',
  description: 'View server statistics dashboard',
  permissionsRequired: [PermissionFlagsBits.Administrator],
  
  callback: async (client, interaction) => {
    await interaction.deferReply();
    
    const guild = interaction.guild;
    
    // Member Statistics
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    
    // Channel Statistics
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;
    
    // Role Statistics
    const roleCount = guild.roles.cache.size;
    
    // Server Info
    const serverCreated = Math.floor(guild.createdTimestamp / 1000);
    
    const embed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name} Dashboard`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor('#00ff00')
      .addFields(
        { 
          name: '👥 Member Stats',
          value: `Total: ${totalMembers}\nOnline: ${onlineMembers}\nBots: ${botCount}`,
          inline: true
        },
        {
          name: '📺 Channel Stats',
          value: `Text: ${textChannels}\nVoice: ${voiceChannels}\nCategories: ${categories}`,
          inline: true
        },
        {
          name: '🎭 Role Stats',
          value: `Total Roles: ${roleCount}`,
          inline: true
        },
        {
          name: '📅 Server Created',
          value: `<t:${serverCreated}:R>`,
          inline: true
        }
      )
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
