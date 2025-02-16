
const { EmbedBuilder } = require('discord.js');

async function logAction(client, action, details, interaction = null) {
  const logChannel = await client.channels.fetch('1320251546813988905');
  if (!logChannel) return;

  let embedDescription = `**Action:** ${action}\n`;
  
  if (interaction) {
    const commandName = interaction.commandName;
    const options = interaction.options?.data || [];
    const location = interaction.guild 
      ? `Server: ${interaction.guild.name} (${interaction.guild.id})`
      : 'Direct Message';
    
    embedDescription += `**Command:** /${commandName}\n`;
    embedDescription += `**User:** ${interaction.user.tag} (${interaction.user.id})\n`;
    embedDescription += `**Location:** ${location}\n`;
    
    if (options.length > 0) {
      const optionsString = options
        .map(opt => `${opt.name}: ${opt.value}`)
        .join(', ');
      embedDescription += `**Options:** ${optionsString}\n`;
    }
  }
  
  embedDescription += `**Details:** ${details}`;

  const embed = new EmbedBuilder()
    .setTitle('Bot Action Log')
    .setDescription(embedDescription)
    .setTimestamp()
    .setColor('#00ff00');

  try {
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send log:', error);
  }
}

module.exports = { logAction };
