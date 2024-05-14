module.exports = {
    name: 'minecraft',
    description: "The Owner's offical Minecraft server, Please Note that this command is only for the Bot's Main server",
    testOnly:'true',
    deleted: false,
    callback: async (client, interaction) => {
    interaction.reply(`You are invited to join the Minecraft server! 192.168.5.67:25565`)
    },
  };
