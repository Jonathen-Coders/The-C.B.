module.exports = {
    devOnly: true,
    name: 'presence',
    description: 'Sets the bot\'s presence.',
    execute(client, interaction) {
        const requiredRole = 'Admin';
        if (!interaction.member.roles.cache.some(role => role.name === requiredRole)) {
            interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
            return;
        }
        const presenceOptions = {
            activities: [{
                name: 'with your heart',
                type: 'PLAYING'
            }],
            status: 'online'
        };
        client.user.setPresence(presenceOptions);
        interaction.reply({ content: 'Presence set!', ephemeral: true });
    }
};