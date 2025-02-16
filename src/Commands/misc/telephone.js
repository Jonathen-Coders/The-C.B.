
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
        connection1.receiver.speaking.on('start', (userId) => {
          try {
            const audioStream = connection1.receiver.subscribe(userId, {
              end: {
                behavior: EndBehaviorType.AfterSilence,
                duration: 500,
              },
            });
            const resource = createAudioResource(audioStream, {
              inputType: StreamType.Opus,
              inlineVolume: true,
            });
            resource.volume.setVolume(1.5);
            player2.play(resource);
          } catch (error) {
            console.error('Error forwarding audio from connection1:', error);
          }
        });

        connection2.receiver.speaking.on('start', (userId) => {
          try {
            const audioStream = connection2.receiver.subscribe(userId, {
              end: {
                behavior: EndBehaviorType.AfterSilence,
                duration: 500,
              },
            });
            const resource = createAudioResource(audioStream, {
              inputType: StreamType.Opus,
              inlineVolume: true,
            });
            resource.volume.setVolume(1.5);
            player1.play(resource);
          } catch (error) {
            console.error('Error forwarding audio from connection2:', error);
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
  },
};
