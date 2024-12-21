
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'broadcast',
  description: 'Send a message to all servers',
  devOnly: true,
  options: [
    {
      name: 'message',
      description: 'The message to broadcast',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  callback: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    
    const message = interaction.options.getString('message');
    let successCount = 0;
    let failCount = 0;

    for (const guild of client.guilds.cache.values()) {
      try {
        // Try to send to the first available text channel
        const channel = guild.channels.cache
          .find(channel => channel.type === 0 && 
                channel.permissionsFor(guild.members.me)
                .has(['SendMessages', 'ViewChannel']));
                
        if (channel) {
          await channel.send(message);
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Failed to send to guild ${guild.name}:`, error);
        failCount++;
      }
    }

    await interaction.editReply(
      `Broadcast complete!\nSuccessfully sent to: ${successCount} servers\nFailed to send to: ${failCount} servers`
    );
  },
};
