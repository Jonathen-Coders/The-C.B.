
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'site',
    description: 'Get a link to the bot website',
    callback: async (client, interaction) => {
        try {
            // Replace this URL with your GitHub Pages URL
            const websiteUrl = 'https://bot-site.joncodingreviews.com/';
            
            await interaction.reply({
                content: `🌐 **Bot Website**: [Click Here](${websiteUrl})`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            await interaction.reply('An error occurred while fetching the website link.');
        }
    },
};
