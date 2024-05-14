const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'announce',
    deleted:false,
    description: 'Announce in any channel',
    options: [
        {
            name: 'title',
            description: 'The title of the announcement',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'text',
            description: 'Description of the announcement',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'channel',
            description: 'The channel where you want to send the message',
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
        {
            name: 'ping',
            description: 'Ping everyone',
            type: ApplicationCommandOptionType.Boolean,
            required: true,
        },
        ],
        permissionsRequired: ['ADMINISTRATOR'],
        botPermissions: ['ADMINISTRATOR'],
        callback: async (client, interaction) => {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ADMINISTRATOR)) {
                return interaction.reply({ content: `You don't have permission to create an announcement!`, ephemeral: true });
            }
            const ping = interaction.options.getBoolean('ping');
            const channel = interaction.options.getChannel('channel');
            if (!channel.permissionsFor(client.user).has(PermissionFlagsBits.ADMINISTRATOR)) {
                return interaction.reply({ content: `I don't have permission to post in this channel!`, ephemeral: true });
            }
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('text');
            if (description.length > 2048) {
                return interaction.reply({ content: `The description is too long! It must be 2048 characters or less.`, ephemeral: true });
            }
            const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(title)
            .setDescription(description);
            let content = '';
            if (ping) {
                content += '<@&1226729554681270375> ';
            }
        
            try {
                await channel.send({ content: content, embeds: [embed] });
                await interaction.reply({ content: `👌 Successfully posted the announcement in #${channel.name}!`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply(`There was an issue posting the announcement in ${channel.name}!`);
            }
        },
        }