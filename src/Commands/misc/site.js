const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'site',
    description: 'Get a link to the bot website',
    callback: async (client, interaction) => {
        try {
            // Replace the URL with your actual bot website
            const websiteUrl = 'https://bot-site.joncodingreviews.com/';

            interaction.reply(`Here's the link to the bot website: ${websiteUrl}`);
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while fetching the website link.');
        }
    },
};
