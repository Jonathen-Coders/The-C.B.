
const { ApplicationCommandOptionType, Permissions } = require('discord.js');


module.exports = {
    name: 'nickname',
    description: 'Change nickname across two servers',
    options: [
        {
            name: 'newnick',
            description: 'The new nickname',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ], // Add a comma here
    async execute(interaction) {
        // Check if the user has the necessary permissions
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
            return interaction.reply('You do not have permission to change nicknames.');
        }

        // Get the new nickname from the command options
        const newNickname = interaction.options.getString('nickname');

        // Get the guilds where the nickname should be changed
        const guild1 = interaction.guild;
        const guild2 = interaction.client.guilds.cache.get('553403663205531678'); // Replace GUILD_ID_2 with the ID of the second guild

        // Change the nickname in both guilds
        try {
            await guild1.me.setNickname(newNickname);
            await guild2.me.setNickname(newNickname);
            interaction.reply(`Nickname changed to "${newNickname}" in both servers.`);
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while changing the nickname.');
        }
    },
};