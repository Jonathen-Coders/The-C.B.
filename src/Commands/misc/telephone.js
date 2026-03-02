const { ApplicationCommandOptionType, PermissionFlagsBits, ChannelType } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource,
  StreamType,
  VoiceConnectionStatus,
  entersState,
  EndBehaviorType
} = require('@discordjs/voice');

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
    {
      name: 'move',
      description: 'Move users to the phone booth channel',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'user',
          description: 'User to move to phone booth (leave empty to move all users)',
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
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
          type: ChannelType.GuildVoice
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

      try {
        const connection1 = joinVoiceChannel({
          channelId: sourceChannel.id,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        connection1.on(VoiceConnectionStatus.Disconnected, async () => {
          try {
            await Promise.race([
              entersState(connection1, VoiceConnectionStatus.Signalling, 5_000),
              entersState(connection1, VoiceConnectionStatus.Connecting, 5_000),
            ]);
          } catch (error) {
            connection1.destroy();
            if (client.activePhoneCalls?.has(interaction.guildId)) {
              client.activePhoneCalls.delete(interaction.guildId);
            }
          }
        });

        const connection2 = joinVoiceChannel({
          channelId: targetChannel.id,
          guildId: targetServerId,
          adapterCreator: targetGuild.voiceAdapterCreator,
        });

        connection2.on(VoiceConnectionStatus.Disconnected, async () => {
          try {
            await Promise.race([
              entersState(connection2, VoiceConnectionStatus.Signalling, 5_000),
              entersState(connection2, VoiceConnectionStatus.Connecting, 5_000),
            ]);
          } catch (error) {
            connection2.destroy();
            if (client.activePhoneCalls?.has(targetServerId)) {
              client.activePhoneCalls.delete(targetServerId);
            }
          }
        });

        const player1 = createAudioPlayer();
        const player2 = createAudioPlayer();

        connection1.subscribe(player1);
        connection2.subscribe(player2);

        // Forward audio between connections
        let activeStreams = new Map();

        connection1.receiver.speaking.on('start', (userId) => {
          try {
            // Cleanup previous stream if exists
            if (activeStreams.has(userId)) {
              activeStreams.get(userId).destroy();
              activeStreams.delete(userId);
            }

            const audioStream = connection1.receiver.subscribe(userId, {
              end: {
                behavior: EndBehaviorType.Manual,
              },
            });

            activeStreams.set(userId, audioStream);

            audioStream.on('error', (error) => {
              console.error('Audio stream error:', error);
              audioStream.destroy();
              activeStreams.delete(userId);
            });

            const resource = createAudioResource(audioStream, {
              inputType: StreamType.Opus,
              inlineVolume: true,
              silencePaddingFrames: 0,
            });

            resource.volume?.setVolume(2);

            resource.playStream.on('error', error => {
              console.error('Audio stream playback error:', error);
              player2.stop();
            });
            player2.play(resource);
          } catch (error) {
            console.error('Error forwarding audio from connection1:', error);
          }
        });

        connection2.receiver.speaking.on('start', (userId) => {
          try {
            // Cleanup previous stream if exists
            if (activeStreams.has(userId)) {
              activeStreams.get(userId).destroy();
              activeStreams.delete(userId);
            }

            const audioStream = connection2.receiver.subscribe(userId, {
              end: {
                behavior: EndBehaviorType.Manual,
              },
            });

            activeStreams.set(userId, audioStream);

            audioStream.on('error', (error) => {
              console.error('Audio stream error:', error);
              audioStream.destroy();
              activeStreams.delete(userId);
            });

            const resource = createAudioResource(audioStream, {
              inputType: StreamType.Opus,
              inlineVolume: true,
              silencePaddingFrames: 0,
            });

            resource.volume?.setVolume(2);

            resource.playStream.on('error', error => {
              console.error('Audio stream playback error:', error);
              player1.stop();
            });
            player1.play(resource);
          } catch (error) {
            console.error('Error forwarding audio from connection2:', error);
          }
        });

        // Cleanup streams when users stop speaking
        connection1.receiver.speaking.on('end', (userId) => {
          if (activeStreams.has(userId)) {
            activeStreams.get(userId).destroy();
            activeStreams.delete(userId);
          }
        });

        connection2.receiver.speaking.on('end', (userId) => {
          if (activeStreams.has(userId)) {
            activeStreams.get(userId).destroy();
            activeStreams.delete(userId);
          }
        });

        // Store connections for cleanup
        client.activePhoneCalls.set(interaction.guildId, {
          targetId: targetServerId,
          connection: connection1,
          player: player1
        });

        client.activePhoneCalls.set(targetServerId, {
          targetId: interaction.guildId,
          connection: connection2,
          player: player2
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
      const callData = client.activePhoneCalls?.get(interaction.guildId);

      if (!callData) {
        return interaction.reply({ content: 'No active call to hang up!', ephemeral: true });
      }

      const targetCallData = client.activePhoneCalls?.get(callData.targetId);

      if (callData.connection) callData.connection.destroy();
      if (targetCallData?.connection) targetCallData.connection.destroy();

      client.activePhoneCalls.delete(interaction.guildId);
      client.activePhoneCalls.delete(callData.targetId);

      await interaction.reply({ content: '📞 Call ended!', ephemeral: false });
      const targetGuild = client.guilds.cache.get(callData.targetId);
      const targetChannel = targetGuild?.channels.cache.find(ch => ch.name === 'phone-booth');
      if (targetChannel) await targetChannel.send('📞 Call ended by other server.');
    }
    
    if (subcommand === 'move') {
      // Check if user has proper permissions
      if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
        return interaction.reply({ 
          content: 'You need Move Members permission to move users.', 
          ephemeral: true 
        });
      }
      
      // Check if the bot has proper permissions
      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.MoveMembers)) {
        return interaction.reply({ 
          content: 'I need Move Members permission to move users.', 
          ephemeral: true 
        });
      }
      
      // Find phone booth channel
      const phoneBoothChannel = interaction.guild.channels.cache.find(
        ch => ch.name === 'phone-booth' && ch.type === ChannelType.GuildVoice
      );
      
      if (!phoneBoothChannel) {
        return interaction.reply({ 
          content: 'Phone booth channel not found. Please set it up first with `/telephone setup`.', 
          ephemeral: true 
        });
      }
      
      const targetUser = interaction.options.getUser('user');
      let movedCount = 0;
      let failedCount = 0;
      
      try {
        await interaction.deferReply();
        
        if (targetUser) {
          // Move a specific user
          const guildMember = await interaction.guild.members.fetch(targetUser.id);
          
          if (!guildMember.voice.channelId) {
            return interaction.editReply(`${targetUser.username} is not in a voice channel.`);
          }
          
          if (guildMember.voice.channelId === phoneBoothChannel.id) {
            return interaction.editReply(`${targetUser.username} is already in the phone booth.`);
          }
          
          await guildMember.voice.setChannel(phoneBoothChannel.id);
          return interaction.editReply(`Moved ${targetUser.username} to the phone booth.`);
        } else {
          // Move all users in voice channels (except those already in phone booth)
          const voiceChannels = interaction.guild.channels.cache.filter(
            ch => ch.type === ChannelType.GuildVoice && ch.id !== phoneBoothChannel.id
          );
          
          for (const [_, channel] of voiceChannels) {
            for (const [memberId, member] of channel.members) {
              try {
                await member.voice.setChannel(phoneBoothChannel.id);
                movedCount++;
              } catch (error) {
                failedCount++;
                console.error(`Failed to move member ${memberId}:`, error);
              }
            }
          }
          
          if (movedCount === 0 && failedCount === 0) {
            return interaction.editReply('No users found in other voice channels to move.');
          }
          
          let response = `Successfully moved ${movedCount} user(s) to the phone booth.`;
          if (failedCount > 0) {
            response += ` Failed to move ${failedCount} user(s).`;
          }
          return interaction.editReply(response);
        }
      } catch (error) {
        console.error('Error moving users:', error);
        return interaction.editReply('There was an error moving users to the phone booth.');
      }
    }
  },
};