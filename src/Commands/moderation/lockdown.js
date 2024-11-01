const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');

const onboardingChannelIds = [
    '1226729555050631213', '1226729555050631212', '1226729555050631211',
    '1231001022818812026', '1226729555050631217', '1226729555050631216',
    '1226729555050631215', '1242964605584543755', '1239838640784408576'
];

module.exports = {
    name: 'lockdown',
    description: 'Locks down the guild by restricting all members from sending messages in all text channels.',
    devOnly: true,
    deleted: true,
    options: [
        {
            name: 'duration',
            description: 'Duration of the lockdown in minutes',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
    async execute(interaction) {
        try {
            const duration = interaction.options.getInteger('duration');
            console.log(`Duration: ${duration}`);
            const guild = interaction.guild;

            if (!guild) {
                return interaction.reply({ content: 'This command can only be used in a guild.', ephemeral: true });
            }

            const channels = guild.channels.cache.filter(channel => channel.isTextBased());

            for (const channel of channels.values()) {
                if (onboardingChannelIds.includes(channel.id)) {
                    console.log(`Skipping onboarding channel: ${channel.name}`);
                    continue;
                }
                console.log(`Locking down channel: ${channel.name}`);
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    [PermissionsBitField.Flags.SendMessages]: false,
                });
            }

            await interaction.reply({ content: `Guild has been locked down${duration ? ` for ${duration} minutes` : ''}.`, ephemeral: true });

            if (duration) {
                setTimeout(async () => {
                    for (const channel of channels.values()) {
                        if (onboardingChannelIds.includes(channel.id)) {
                            console.log(`Skipping onboarding channel: ${channel.name}`);
                            continue;
                        }
                        console.log(`Lifting lockdown for channel: ${channel.name}`);
                        await channel.permissionOverwrites.edit(guild.roles.everyone, {
                            [PermissionsBitField.Flags.SendMessages]: null,
                        });
                    }
                    await interaction.followUp({ content: 'Lockdown has been lifted.', ephemeral: true });
                }, duration * 60 * 1000);
            }
        } catch (error) {
            console.error('Error editing channel permissions:', error);
            await interaction.reply({ content: 'There was an error while executing the lockdown command.', ephemeral: true });
        }
    },
};
