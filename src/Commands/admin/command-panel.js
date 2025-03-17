
const { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('replit');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = {
    name: 'command-panel',
    description: 'Enable or disable commands for this server',
    options: [
        {
            name: 'action',
            description: 'Enable or disable a command',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Enable', value: 'enable' },
                { name: 'Disable', value: 'disable' },
                { name: 'List', value: 'list' }
            ]
        },
        {
            name: 'command',
            description: 'The command to enable/disable',
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        const action = interaction.options.getString('action');
        const commandName = interaction.options.getString('command');
        const guildId = interaction.guild.id;
        const dbKey = `commands_disabled_${guildId}`;

        try {
            if (action === 'list') {
                const disabledCommands = await db.get(dbKey) || [];
                const localCommands = await getLocalCommands();
                
                const embed = new EmbedBuilder()
                    .setTitle('Command Status')
                    .setDescription('List of all commands and their status')
                    .setColor('#00ff00');

                for (const cmd of localCommands) {
                    if (!cmd.devOnly) {
                        embed.addFields({
                            name: cmd.name,
                            value: disabledCommands.includes(cmd.name) ? '❌ Disabled' : '✅ Enabled',
                            inline: true
                        });
                    }
                }

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (!commandName) {
                return interaction.reply({
                    content: 'Please specify a command name',
                    ephemeral: true
                });
            }

            const localCommands = await getLocalCommands();
            const command = localCommands.find(cmd => cmd.name === commandName);
            
            if (!command || command.devOnly) {
                return interaction.reply({
                    content: 'Command not found or cannot be modified',
                    ephemeral: true
                });
            }

            let disabledCommands = await db.get(dbKey) || [];

            if (action === 'enable') {
                disabledCommands = disabledCommands.filter(cmd => cmd !== commandName);
                await db.set(dbKey, disabledCommands);
                return interaction.reply({
                    content: `✅ Command "${commandName}" has been enabled`,
                    ephemeral: true
                });
            } else if (action === 'disable') {
                if (!disabledCommands.includes(commandName)) {
                    disabledCommands.push(commandName);
                }
                await db.set(dbKey, disabledCommands);
                return interaction.reply({
                    content: `❌ Command "${commandName}" has been disabled`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Command panel error:', error);
            return interaction.reply({
                content: 'An error occurred while managing commands',
                ephemeral: true
            });
        }
    }
};
