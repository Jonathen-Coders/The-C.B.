module.exports = {
    name: 'minecraft',
    description: "The Owner's offical Minecraft server, Only use in main server",
    testOnly:'true',
    deleted: false,
    callback: async (client, interaction) => {
    interaction.reply(`You are invited to join the Minecraft server! 192.168.5.67:25565`)
    },
  };
