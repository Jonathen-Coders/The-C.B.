
const { ApplicationCommandOptionType } = require('discord.js');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = {
    name: 'help',
    description: 'Displays information about available commands.',
    options: [
        {
            name: 'command',
            description: 'Get detailed help for a specific command',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    callback: async (client, interaction) => {
        try {
            const localCommands = getLocalCommands();
            const activeCommands = localCommands.filter(cmd => !cmd.deleted);
            const commandName = interaction.options.getString('command');

            if (commandName) {
                const command = activeCommands.find(cmd => cmd.name === commandName);
                if (!command) {
                    return interaction.reply({
                        content: `Command "${commandName}" not found.`,
                        ephemeral: true
                    });
                }

                let detailedHelp = `**Command: /${command.name}**\n`;
                detailedHelp += `Description: ${command.description}\n`;

                if (command.options?.length > 0) {
                    detailedHelp += '\n**Options:**\n';
                    command.options.forEach(opt => {
                        detailedHelp += `- ${opt.name}: ${opt.description}`;
                        if (opt.required) detailedHelp += ' (Required)';
                        if (opt.choices) {
                            detailedHelp += `\n  Choices: ${opt.choices.map(c => c.name).join(', ')}`;
                        }
                        detailedHelp += '\n';
                    });
                }

                return interaction.reply({
                    content: detailedHelp,
                    ephemeral: true
                });
            }

            // Group commands by category
            const commandsByCategory = {};
            
            activeCommands.forEach(cmd => {
                const cmdPath = cmd.__filename || '';
                const category = cmdPath.split('/Commands/')[1]?.split('/')[0] || 'misc';
                if (!commandsByCategory[category]) {
                    commandsByCategory[category] = [];
                }
                commandsByCategory[category].push(cmd);
            });

            let helpMessage = '**Available Commands**\n';
            helpMessage += 'Use `/help command:<command-name>` for detailed information about a specific command.\n\n';

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
