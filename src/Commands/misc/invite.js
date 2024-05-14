module.exports = {
    name: 'invite',
    description: 'Invite the bot to your server!',
    deleted: false,
    callback: async (client, interaction) => {
    interaction.reply(`Invite me by clicking this link. https://discord.com/oauth2/authorize?client_id=1223029059034943489&permissions=8&scope=bot+applications.commands `)
    },
  };