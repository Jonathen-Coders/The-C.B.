
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'update',
  description: 'Broadcast an update announcement to all servers',
  devOnly: true,
  options: [
    {
      name: 'version',
      description: 'Version number of the update',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'description',
      description: 'Description of the update changes',
      type: ApplicationCommandOptionType.String,
      required: true,
    }
  ],

  callback: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    
    const version = interaction.options.getString('version');
    const description = interaction.options.getString('description');
    let successCount = 0;
    let failCount = 0;

    const updateMessage = `🔄 **Bot Update v${version}**\n\n${description}\n\n*This is an automated update announcement.*`;

    for (const guild of client.guilds.cache.values()) {
      try {
        let channel = guild.channels.cache.find(ch => 
          ch.name === 'bot-updates' && 
          ch.type === 0
        );

        if (!channel) {
          try {
            channel = await guild.channels.create({
              name: 'bot-updates',
              type: 0,
              topic: 'Official bot update announcements',
              permissionOverwrites: [
                {
                  id: guild.id,
                  allow: ['ViewChannel'],
                  deny: ['SendMessages']
                },
                {
                  id: client.user.id,
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
          await channel.send(updateMessage);
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
      `Update announcement complete!\nSuccessfully sent to: ${successCount} servers\nFailed to send to: ${failCount} servers`
    );
  },
};
