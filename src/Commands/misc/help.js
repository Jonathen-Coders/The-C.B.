
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = {
    name: 'help',
    description: 'Displays information about available commands.',
    callback: async (client, interaction) => {
        try {
            const localCommands = getLocalCommands();
            const activeCommands = localCommands.filter(cmd => !cmd.deleted);

            // Group commands by category
            const commandsByCategory = {};
            
            activeCommands.forEach(cmd => {
                // Extract category from command file path
                const cmdPath = cmd.__filename || '';
                const category = cmdPath.split('/Commands/')[1]?.split('/')[0] || 'misc';
                if (!commandsByCategory[category]) {
                    commandsByCategory[category] = [];
                }
                commandsByCategory[category].push(cmd);
            });

            let helpMessage = '**Available Commands**\n';

            // Add commands by category
            for (const [category, commands] of Object.entries(commandsByCategory)) {
                helpMessage += `\n**${category.charAt(0).toUpperCase() + category.slice(1)}**\n`;
                commands.forEach(cmd => {
                    helpMessage += `- \`/${cmd.name}\`: ${cmd.description}\n`;
                });
            }

            await interaction.reply({
                content: helpMessage,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while fetching the help information.',
                ephemeral: true
            });
        }
    },
};
