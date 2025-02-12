
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'broadcast',
  description: 'Send a message to all servers in a dedicated channel that is made',
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
        let channel = guild.channels.cache.find(ch => 
          ch.name === 'bot-announcements' && 
          ch.type === 0
        );

        // Create the channel if it doesn't exist
        if (!channel) {
          try {
            channel = await guild.channels.create({
              name: 'bot-announcements',
              type: 0, // Text channel
              topic: 'Official announcements from the bot',
              permissionOverwrites: [
                {
                  id: guild.id, // @everyone role
                  allow: ['ViewChannel'],
                  deny: ['SendMessages']
                },
                {
                  id: client.user.id, // Bot's ID
                  allow: ['ViewChannel', 'SendMessages']
                }
              ]
            });
          } catch (error) {
            console.error(`Failed to create channel in ${guild.name}:`, error);
            failCount++;
            continue;
          }
        }

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
