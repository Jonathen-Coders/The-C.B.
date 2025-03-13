
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const minecraftManager = require('../../utils/minecraftManager');
const { mainServer } = require('../../../config.json');

module.exports = {
    name: 'minecraft',
    description: "Connect to and view info about the Minecraft server",
    options: [
        {
            name: 'action',
            description: 'Action to perform',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'status',
                    value: 'status'
                },
                {
                    name: 'info',
                    value: 'info'
                }
            ]
        }
    ],
    callback: async (client, interaction) => {
        // Only allow in main server
        if (interaction.guild && interaction.guild.id !== mainServer) {
            return interaction.reply({
                content: 'This command can only be used in the main server.',
                ephemeral: true
            });
        }
        
        const action = interaction.options.getString('action') || 'info';
        
        try {
            switch (action) {
                case 'status':
                    if (minecraftManager.isConnected()) {
                        await interaction.deferReply();
                        const status = await minecraftManager.getServerStatus();
                        
                        const embed = new EmbedBuilder()
                            .setTitle('Minecraft Server Status')
                            .setDescription(`Server: ${status.serverInfo.host}:${status.serverInfo.port}`)
                            .addFields(
                                { name: 'Players', value: status.players || 'Unknown' },
                                { name: 'Performance', value: status.performance || 'Unknown' },
                                { name: 'World Info', value: status.worldInfo || 'Unknown' }
                            )
                            .setColor('#00FF00')
                            .setTimestamp();
                        
                        await interaction.editReply({ embeds: [embed] });
                    } else {
                        await interaction.reply({
                            content: 'Not connected to the Minecraft server. Ask an admin to connect using the `/mc connect` command.',
                            ephemeral: true
                        });
                    }
                    break;
                    
                case 'info':
                default:
                    const serverAddress = process.env.MC_SERVER_ADDRESS || "play.example.com";
                    const serverPort = process.env.MC_SERVER_PORT || "25565";
                    
                    const embed = new EmbedBuilder()
                        .setTitle('Minecraft Server Information')
                        .setDescription('Connect to our official Minecraft server!')
                        .addFields(
                            { name: 'Server Address', value: `${serverAddress}${serverPort !== "25565" ? `:${serverPort}` : ""}` },
                            { name: 'Version', value: 'Latest version (Java Edition)' },
                            { name: 'Hosting', value: 'BisectHosting' }
                        )
                        .setColor('#00FF00')
                        .setTimestamp();
                    
                    await interaction.reply({ embeds: [embed] });
                    break;
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `An error occurred: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
