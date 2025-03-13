
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { Rcon } = require('rcon-client');

module.exports = {
    devOnly: true,
    name: 'mc',
    description: 'Connect to and control a Minecraft server',
    options: [
        {
            name: 'action',
            description: 'Action to perform',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'connect',
                    value: 'connect'
                },
                {
                    name: 'disconnect',
                    value: 'disconnect'
                },
                {
                    name: 'command',
                    value: 'command'
                },
                {
                    name: 'status',
                    value: 'status'
                },
                {
                    name: 'say',
                    value: 'say'
                }
            ]
        },
        {
            name: 'input',
            description: 'Command to execute or message to send',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'server',
            description: 'Server to connect to (host:port)',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'password',
            description: 'RCON password',
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    callback: async (client, interaction) => {
        try {
            const action = interaction.options.getString('action');
            const input = interaction.options.getString('input');
            
            // Get server connection info from options or environment variables
            const serverString = interaction.options.getString('server') || process.env.MC_SERVER;
            const password = interaction.options.getString('password') || process.env.MC_PASSWORD;
            
            // Handle case where no server info is provided
            if (action === 'connect' && (!serverString || !password)) {
                return interaction.reply({
                    content: 'You must provide server information and password to connect.',
                    ephemeral: true
                });
            }
            
            // Parse server string into host and port
            let host, port;
            if (serverString) {
                const parts = serverString.split(':');
                host = parts[0];
                port = parts.length > 1 ? parseInt(parts[1]) : 25575; // Default RCON port
            }
            
            switch (action) {
                case 'connect':
                    await handleConnect(client, interaction, host, port, password);
                    break;
                case 'disconnect':
                    await handleDisconnect(client, interaction);
                    break;
                case 'command':
                    await handleCommand(client, interaction, input);
                    break;
                case 'status':
                    await handleStatus(client, interaction);
                    break;
                case 'say':
                    await handleSay(client, interaction, input);
                    break;
                default:
                    await interaction.reply({
                        content: 'Invalid action specified.',
                        ephemeral: true
                    });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `An error occurred: ${error.message}`,
                ephemeral: true
            });
        }
    }
};

// Store RCON connection in client for reuse
async function handleConnect(client, interaction, host, port, password) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
        // Check if we already have an active connection
        if (client.rcon && client.rcon.connected) {
            await interaction.editReply('Already connected to a Minecraft server. Disconnect first.');
            return;
        }
        
        // Create a new connection
        client.rcon = new Rcon({ host, port, password });
        
        // Set up event listeners for log messages
        client.rcon.on('connect', () => {
            console.log(`Connected to Minecraft server at ${host}:${port}`);
        });
        
        client.rcon.on('error', (error) => {
            console.error('RCON error:', error);
        });
        
        client.rcon.on('end', () => {
            console.log('RCON connection closed');
            client.rcon = null;
        });
        
        // Connect to the server
        await client.rcon.connect();
        
        // Save connection info
        client.mcServerInfo = { host, port };
        
        // Create embed with connection details
        const embed = new EmbedBuilder()
            .setTitle('Minecraft Server Connected')
            .setDescription(`Connected to ${host}:${port}`)
            .setColor('#00FF00')
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Connection error:', error);
        await interaction.editReply(`Failed to connect: ${error.message}`);
    }
}

async function handleDisconnect(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
        if (!client.rcon || !client.rcon.connected) {
            await interaction.editReply('Not connected to any Minecraft server.');
            return;
        }
        
        await client.rcon.end();
        client.rcon = null;
        client.mcServerInfo = null;
        
        await interaction.editReply('Disconnected from Minecraft server.');
    } catch (error) {
        console.error('Disconnect error:', error);
        await interaction.editReply(`Failed to disconnect: ${error.message}`);
    }
}

async function handleCommand(client, interaction, command) {
    if (!command) {
        await interaction.reply({
            content: 'You must provide a command to execute.',
            ephemeral: true
        });
        return;
    }
    
    await interaction.deferReply();
    
    try {
        if (!client.rcon || !client.rcon.connected) {
            await interaction.editReply('Not connected to any Minecraft server. Use `/mc connect` first.');
            return;
        }
        
        const response = await client.rcon.send(command);
        
        // Create embed with command results
        const embed = new EmbedBuilder()
            .setTitle('Minecraft Command')
            .addFields(
                { name: 'Command', value: `\`${command}\`` },
                { name: 'Response', value: response || '(No response)' }
            )
            .setColor('#0099FF')
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Command error:', error);
        await interaction.editReply(`Failed to execute command: ${error.message}`);
    }
}

async function handleStatus(client, interaction) {
    await interaction.deferReply();
    
    try {
        if (!client.rcon || !client.rcon.connected) {
            await interaction.editReply('Not connected to any Minecraft server. Use `/mc connect` first.');
            return;
        }
        
        // Get server info using various commands
        const [
            playerList,
            tps,
            worldInfo
        ] = await Promise.all([
            client.rcon.send('list'),
            client.rcon.send('tps'),
            client.rcon.send('time query daytime')
        ]);
        
        // Create embed with server status
        const embed = new EmbedBuilder()
            .setTitle('Minecraft Server Status')
            .setDescription(`Connected to ${client.mcServerInfo.host}:${client.mcServerInfo.port}`)
            .addFields(
                { name: 'Players', value: playerList || 'Unknown' },
                { name: 'Performance', value: tps || 'Unknown' },
                { name: 'World Info', value: worldInfo || 'Unknown' }
            )
            .setColor('#00FF00')
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Status error:', error);
        await interaction.editReply(`Failed to get server status: ${error.message}`);
    }
}

async function handleSay(client, interaction, message) {
    if (!message) {
        await interaction.reply({
            content: 'You must provide a message to send.',
            ephemeral: true
        });
        return;
    }
    
    await interaction.deferReply();
    
    try {
        if (!client.rcon || !client.rcon.connected) {
            await interaction.editReply('Not connected to any Minecraft server. Use `/mc connect` first.');
            return;
        }
        
        // Send a say command to the server
        await client.rcon.send(`say ${message}`);
        
        await interaction.editReply(`Message sent to Minecraft server: ${message}`);
    } catch (error) {
        console.error('Say error:', error);
        await interaction.editReply(`Failed to send message: ${error.message}`);
    }
}
