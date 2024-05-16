
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

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
        {
            name: 'user',
            description: 'The user whose nickname to change',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
    callback: async (client, interaction) => {
        try {
            // Check if the user has the necessary permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                return interaction.reply('You do not have permission to change nicknames.');
            }
    
            // Get the new nickname from the command options
            const user = interaction.options.getMember('user');
            const newNickname = interaction.options.getString('newnick');
    
            // Check if the user is the owner of the guild
            if (user.id === interaction.guild.ownerId) {
                return interaction.reply('I cannot change the nickname of the guild owner.');
            }
    
            // Get the guilds where the nickname should be changed
            const guild1 = interaction.guild;
            const guild2 = client.guilds.cache.get('553403663205531678'); // Replace with the actual second guild ID
    
            // Fetch the user in both guilds
            const member1 = await guild1.members.fetch(user);
            const member2 = await guild2.members.fetch(user);
    
            // Change the nickname in both guilds
            await member1.setNickname(newNickname);
            await member2.setNickname(newNickname);
    
            interaction.reply(`Nickname changed to "${newNickname}" for ${user.tag} in both servers.`);
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while changing the nickname.');
        }
    }, // Add a closing curly brace here
};
