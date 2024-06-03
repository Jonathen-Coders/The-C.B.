const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'server-invite',
    deleted: false,
    description: 'Generate an invite link for the bot to join your server.',
    callback: async (client, interaction) => {
        try {
            // Get the current channel where the command was executed
            const channel = interaction.channel;

            // Create an invite link for the bot to join the server
            const invite = await channel.createInvite({ unique: true, temporary: false });

            // Construct the full invite link
            const inviteLink = `https://discord.gg/${invite.code}`;

            interaction.reply(`Invite the bot to your server by clicking this link: ${inviteLink}`);
        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while generating the server invite link.');
        }
    },
  };