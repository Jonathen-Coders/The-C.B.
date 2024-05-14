const { ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder, ChannelType, PermissionFlagsBits,} = require('discord.js');
module.exports = {
    name: 'announce',
    description: 'To announce in any channel',
   deleted:true,
    options: [
        {
            name:'title',
            description:' The Title of the embed',
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
          name: 'text',
          description: 'Description of the text you want to send.',
          required: true,
          type: ApplicationCommandOptionType.String,
        },
        {
            name:'channel',
            description:'The channel you want to send the message in',
            required: true,
            type: ApplicationCommandOptionType.Channel,
        },
  
    ],  
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],
    callback: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `You don't have the permissions to create an announcement!`, ephemeral: true});
        
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('text');

        const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`${title}`)
        .setDescription(`${description}`)

        await channel.send({content:`||@everyone||`, embeds: [embed]}).catch(err => {
            return interaction.reply(`I had a problem posting the announcement in ${channel}!`);
        })
        await interaction.reply({ content: `👌 I successfully posted the announcement in #${channel}!`, ephemeral: true});
    },

};