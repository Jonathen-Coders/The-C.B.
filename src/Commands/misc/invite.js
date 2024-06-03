const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'invite',
    description: 'Invite the bot to your server or get the bot server invite link.',
    options: [
        {
            name: 'target',
            description: 'Specify "bot" or "server"',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'bot', value: 'bot' },
                { name: 'server', value: 'server' },
            ],
        },
    ],
    callback: async (client, interaction) => {
        try {
            const target = interaction.options.getString('target');

            if (target === 'bot') {
                // Provide a link to invite the bot to the user's server
                const botInviteLink = 'https://discord.com/oauth2/authorize?client_id=1223029059034943489&permissions=8&scope=bot+applications.commands';
                interaction.reply(`Invite me to your server by clicking this link: ${botInviteLink}`);
            } else if (target === 'server') {
                // Provide a link to the bot's Discord server
                const botServerInviteLink = 'https://discord.gg/a6m3cfEdkn'; // Replace with your actual server invite link
                interaction.reply(`Join the bot's Discord server here: ${botServerInviteLink}`);
            } else {
                // No specific target provided, display usage instructions
                interaction.reply('Usage: `/invite bot` or `/invite server`');
            }
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while processing the invite command.');
        }
    },
};
