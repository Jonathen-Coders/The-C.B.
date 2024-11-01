const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'nickname',
    description: 'Change nickname across all servers where the bot and user are members',
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

            // Iterate over all guilds the bot is in
            const promises = client.guilds.cache.map(async (guild) => {
                try {
                    // Fetch the member in the guild
                    const member = await guild.members.fetch(user.id);
                    if (member) {
                        // Change the nickname in the guild
                        await member.setNickname(newNickname);
                    }
                } catch (error) {
                    // Ignore errors for guilds where the user is not a member
                    if (error.code !== 10007) { // 10007: Unknown Member
                        console.error(`Error changing nickname in guild ${guild.id}:`, error);
                    }
                }
            });

            // Wait for all nickname changes to complete
            await Promise.all(promises);

            interaction.reply(`Nickname changed to "${newNickname}" for ${user.user.tag} in all servers where the bot and user are members.`);
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while changing the nickname.');
        }
    },
};
