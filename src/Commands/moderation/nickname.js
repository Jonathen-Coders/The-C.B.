
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'nickname',
    description: 'Change nickname across all servers where the bot and user are members',
    options: [
        {
            name: 'user',
            description: 'The user whose nickname to change',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'newnick',
            description: 'The new nickname (leave empty to reset)',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    permissionsRequired: [PermissionFlagsBits.ManageNicknames],
    botPermissions: [PermissionFlagsBits.ManageNicknames],
    
    callback: async (client, interaction) => {
        try {
            const targetUser = interaction.options.getUser('user');
            const newNickname = interaction.options.getString('newnick') || null;

            if (!targetUser) {
                return interaction.reply({
                    content: 'Could not find that user.',
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: true });

            let successCount = 0;
            let failCount = 0;
            const failedGuilds = [];

            // Process all guilds the bot is in
            for (const [, guild] of client.guilds.cache) {
                try {
                    const member = await guild.members.fetch(targetUser.id).catch(() => null);
                    if (!member) continue;

                    // Skip if target is guild owner
                    if (member.id === guild.ownerId) {
                        failCount++;
                        failedGuilds.push(`${guild.name} (Server owner)`);
                        continue;
                    }

                    // Check bot's permissions in this guild
                    const botMember = guild.members.me;
                    if (!botMember.permissions.has(PermissionFlagsBits.ManageNicknames) ||
                        botMember.roles.highest.position <= member.roles.highest.position) {
                        failCount++;
                        failedGuilds.push(`${guild.name} (Insufficient permissions)`);
                        continue;
                    }

                    await member.setNickname(newNickname);
                    successCount++;
                } catch (error) {
                    console.error(`Error in guild ${guild.name}:`, error);
                    failCount++;
                    failedGuilds.push(`${guild.name} (Error occurred)`);
                }
            }

            // Don't show "complete" if we had any successes
            let response = successCount > 0 ? 
                `✅ Successfully changed nickname in ${successCount} server${successCount !== 1 ? 's' : ''}` : 
                `⚠️ No successful nickname changes`;
                
            if (failCount > 0) {
                response += `\n❌ Could not change in ${failCount} server${failCount !== 1 ? 's' : ''}:`;
                response += `\n${failedGuilds.map(g => `- ${g}`).join('\n')}`;
            }

            await interaction.editReply({
                content: response,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in nickname command:', error);
            const reply = interaction.deferred ? 
                interaction.editReply : 
                interaction.reply;
            
            await reply({
                content: 'An error occurred while changing nicknames.',
                ephemeral: true
            });
        }
    },
};
