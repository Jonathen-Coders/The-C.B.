const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');
const { db } = require('replit');
const { logAction } = require('../../utils/logger');

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const guildId = interaction.guild?.id;
  const dbKey = guildId ? `commands_disabled_${guildId}` : null;
  const disabledCommands = dbKey ? (await db.get(dbKey) || []) : [];

  if (disabledCommands.includes(interaction.commandName)) {
    return interaction.reply({
      content: 'This command is disabled in this server.',
      ephemeral: true
    });
  }

  const localCommands = getLocalCommands();
  const commandObject = localCommands.find(
    (cmd) => cmd.name === interaction.commandName
  );

  if (!commandObject) return;

  if (commandObject.devOnly) {
    if (!devs.includes(interaction.member.id)) {
      interaction.reply({
        content: 'Only developers are allowed to run this command.',
        ephemeral: true,
      });
      return;
    }
  }

  if (commandObject.testOnly) {
    if (!(interaction.guild?.id === testServer)) {
      interaction.reply({
        content: 'This command cannot be ran here.',
        ephemeral: true,
      });
      return;
    }
  }

  if (commandObject.permissionsRequired?.length) {
    for (const permission of commandObject.permissionsRequired) {
      if (!interaction.member.permissions.has(permission)) {
        interaction.reply({
          content: 'Not enough permissions.',
          ephemeral: true,
        });
        return;
      }
    }
  }

  if (commandObject.botPermissions?.length) {
    if (interaction.guild) {
      const bot = interaction.guild.members.me;
      for (const permission of commandObject.botPermissions) {
        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: 'I do not have enough permissions.',
            ephemeral: true,
          });
          return;
        }
      }
    }
  }

  try {
    await commandObject.callback(client, interaction);
    // Log the command usage
    await logAction(
      client,
      'Command Executed',
      'Command executed successfully',
      interaction
    );
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
};