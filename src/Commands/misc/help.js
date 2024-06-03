const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Displays information about available commands.',
    callback: async (client, interaction) => {
        try {
            // Customize this message to include information about your specific commands
            const helpMessage = `Here are the available commands:\n
            - \`/autorole-configure\`: Configure autorole settings.\n
            - \`/autorole-disable\`: Disable autorole feature.\n
            - \`/Balance\`: Check user balance.\n
            - \`/daily\`: Claim daily rewards.\n
            - \`/level\`: Display user's level.\n
            - \`/github\`: View the GitHub repository information for the bot.\n
            - \`/site\`: Visit the bot's website.\n
            - \`/invite\`: Get an invite link for the bot.\n
            - \`/minecraft\`!: View Minecraft server ip.\n
            - \`/ping\`: Check bot latency.\n
            - \`/roles\`!: List available roles.\n
            - \`/sever\`*: Makes a new invitelink to your server.\n
            - \`/announce\`: Make announcements.\n
            - \`/ban\`: Ban a user.\n
            - \`/kick\`: Kick a user.\n
            - \`/Nickname\`: Change a user's nickname.\n
            - \`/bulkdelete\`: Delete multiple messages.\n
            - \`/timeout\`: Timeout a user.\n
            (*)This command is a wip or not implented.\n
            (!)This command is for the Main discord server.\n`;

            interaction.reply(helpMessage);
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while fetching the help information.');
        }
    },
};
