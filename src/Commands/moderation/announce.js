const { ApplicationCommandOptionType, PermissionFlagsBits, PermissionsBitField, Permissions } = require('discord.js');
const {MessageEmbed} = require('discord.js');
module.exports = {
    name: 'announce',
    deleted:true,
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
            type: ApplicationCommandOptionType.String, // Add missing type field
            required: true,
        },
        {
            name: 'channel',
            description: 'The channel where you want to send the message',
            type: ApplicationCommandOptionType.Channel, // Add missing type field
            required: true,
        },
        {
            name: 'ping',
            description: 'Ping everyone',
            type: ApplicationCommandOptionType.Boolean, // Add missing type field
            required: true,
        },

    ],

    permissionsRequired: ['ADMINISTRATOR'],
    botPermissions: ['ADMINISTRATOR'],
    callback: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ADMINISTRATOR)) {
            return interaction.reply({ content: `You don't have permission to create an announcement!`, ephemeral: true });
        }
        
        const channel = interaction.options.getChannel('channel');
        if (!channel.permissionsFor(client.user).has(PermissionFlagsBits.ADMINISTRATOR)) {
            return interaction.reply({ content: `I don't have permission to post in this channel!`, ephemeral: true });
        }
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('text');
        const ping = interaction.options.getBoolean('ping');
        const embed = new MessageEmbed()
        .setColor('BLUE')
        .setTitle(title)
        .setDescription(description);
            let content = '';
            if (ping) {
                content += '@everyone ';
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
