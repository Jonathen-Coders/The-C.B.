
const { ApplicationCommandOptionType, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  name: 'telephone',
  description: 'Manage telephone calls between servers',
  options: [
    {
      name: 'call',
      description: 'Call another server',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'server-id',
          description: 'The ID of the server to call',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'hangup',
      description: 'End the current call',
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'setup',
      description: 'Set up the telephone channel',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  callback: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: 'You need Manage Channels permission to set up the telephone system.', ephemeral: true });
      }

      let phoneChannel = interaction.guild.channels.cache.find(ch => ch.name === 'phone-booth');
      
      if (!phoneChannel) {
        phoneChannel = await interaction.guild.channels.create({
          name: 'phone-booth',
          type: ChannelType.GuildVoice,
          topic: 'Phone booth for inter-server calls'
        });
      }

      return interaction.reply({ content: `Phone booth has been set up in ${phoneChannel}!`, ephemeral: true });
    }

    if (subcommand === 'call') {
      const targetServerId = interaction.options.getString('server-id');
      const targetGuild = client.guilds.cache.get(targetServerId);

      if (!targetGuild) {
        return interaction.reply({ content: 'Could not find that server. Make sure the bot is in both servers.', ephemeral: true });
      }

      const sourceChannel = interaction.guild.channels.cache.find(ch => ch.name === 'phone-booth');
      const targetChannel = targetGuild.channels.cache.find(ch => ch.name === 'phone-booth');

      if (!sourceChannel || !targetChannel) {
        return interaction.reply({ content: 'Phone booth not set up in one or both servers. Use `/telephone setup` first.', ephemeral: true });
      }

      // Store call state
      client.activePhoneCalls = client.activePhoneCalls || new Map();
      
      if (client.activePhoneCalls.has(interaction.guildId) || client.activePhoneCalls.has(targetServerId)) {
        return interaction.reply({ content: 'One of the servers is already in a call!', ephemeral: true });
      }

      client.activePhoneCalls.set(interaction.guildId, targetServerId);
      client.activePhoneCalls.set(targetServerId, interaction.guildId);

      // Create call connection
      try {
        const connection1 = await sourceChannel.join();
        const connection2 = await targetChannel.join();
        
        // Connect audio streams
        connection1.on('speaking', (user, speaking) => {
          if (speaking) {
            const audioStream = connection1.receiver.createStream(user);
            connection2.play(audioStream);
          }
        });

        connection2.on('speaking', (user, speaking) => {
          if (speaking) {
            const audioStream = connection2.receiver.createStream(user);
            connection1.play(audioStream);
          }
        });

        await interaction.reply({ content: `📞 Connected to ${targetGuild.name}!`, ephemeral: false });
        await targetChannel.send(`📞 Incoming call from ${interaction.guild.name}!`);
      } catch (error) {
        console.error('Call error:', error);
        client.activePhoneCalls.delete(interaction.guildId);
        client.activePhoneCalls.delete(targetServerId);
        return interaction.reply({ content: 'Failed to establish call connection.', ephemeral: true });
      }
    }

    if (subcommand === 'hangup') {
      const currentCall = client.activePhoneCalls?.get(interaction.guildId);
      
      if (!currentCall) {
        return interaction.reply({ content: 'No active call to hang up!', ephemeral: true });
      }

      const sourceChannel = interaction.guild.channels.cache.find(ch => ch.name === 'phone-booth');
      const targetGuild = client.guilds.cache.get(currentCall);
      const targetChannel = targetGuild?.channels.cache.find(ch => ch.name === 'phone-booth');

      if (sourceChannel) sourceChannel.leave();
      if (targetChannel) targetChannel.leave();

      client.activePhoneCalls.delete(interaction.guildId);
      client.activePhoneCalls.delete(currentCall);

      await interaction.reply({ content: '📞 Call ended!', ephemeral: false });
      if (targetChannel) await targetChannel.send('📞 Call ended by other server.');
    }
  },
};
