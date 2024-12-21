require('dotenv').config();
const {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    ActivityType,
} = require('discord.js');

module.exports = {
    deleted: false,
    name: 'rs',
    description: 'Reboots the bot!',
    devOnly: true,
    testOnly: false,
    options: [
        {
            name: 'passcode',
            description: 'The passcode to restart the bot',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    botPermissions: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        try {
            const providedPasscode = interaction.options.getString('passcode');
            const expectedPasscode = '911'; // Replace with your actual passcode

            if (providedPasscode !== expectedPasscode) {
                return interaction.reply({ content: 'Invalid passcode.', ephemeral: true });
            }

            interaction.reply("⚠️Restarting...");
            client.user.setPresence({
                activities: [{ name: 'the Console for changes', type: ActivityType.Watching }],
                status: 'dnd',
            });

            setTimeout(async () => {
                await interaction.editReply('✅ The bot has been rebooted!').then(() => {
                    client.destroy();
                    console.log(`${client.user.tag} Restarted by ${interaction.user.tag} in ${interaction.guild.name}`);
                });

                await client.login(process.env.TOKEN).catch((err) => console.log(err));
                console.log(`${client.user.tag} Ready`);
            }, 10000);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'An error occurred while trying to restart the bot.', ephemeral: true });
        }
    },
};