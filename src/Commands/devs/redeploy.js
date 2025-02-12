
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  deleted: false,
  name: 'redeploy',
  description: 'Restarts and redeploys the bot',
  devOnly: true,
  testOnly: false,
  options: [
    {
      name: 'passcode',
      description: 'The passcode to redeploy the bot',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  botPermissions: [PermissionFlagsBits.Administrator],

  callback: async (client, interaction) => {
    try {
      const providedPasscode = interaction.options.getString('passcode');
      const expectedPasscode = '911'; // Using same passcode as restart command

      if (providedPasscode !== expectedPasscode) {
        return interaction.reply({ content: 'Invalid passcode.', ephemeral: true });
      }

      await interaction.reply({ content: '⚠️ Initiating redeployment...', ephemeral: true });
      
      // Update status to indicate redeployment
      await client.user.setPresence({
        status: 'dnd',
        activities: [{ name: 'Redeploying...' }]
      });

      setTimeout(async () => {
        await interaction.editReply('✅ Bot is redeploying! This may take a few minutes.');
        process.exit(); // This will trigger the deployment to restart
      }, 3000);
    } catch (error) {
      console.error('Redeployment error:', error);
      await interaction.reply({ 
        content: 'An error occurred during redeployment.',
        ephemeral: true 
      });
    }
  },
};
