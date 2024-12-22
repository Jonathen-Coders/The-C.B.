
const { EmbedBuilder } = require('discord.js');

async function logAction(client, action, details) {
  const logChannel = await client.channels.fetch('1320251546813988905');
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTitle('Bot Action Log')
    .setDescription(`**Action:** ${action}\n**Details:** ${details}`)
    .setTimestamp()
    .setColor('#00ff00');

  try {
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send log:', error);
  }
}

module.exports = { logAction };
