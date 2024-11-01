const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.user.id)) {
        interaction.reply({
          content: 'Only developers are allowed to run this command.',
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (interaction.guild && !(interaction.guild.id === testServer)) {
        interaction.reply({
          content: 'This command cannot be ran here.',
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.permissionsRequired?.length) {
      if (interaction.member) {
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

    // Execute the command
    if (commandObject.execute) {
      await commandObject.execute(client, interaction);
    } else if (commandObject.callback) {
      await commandObject.callback(client, interaction);
    } else {
      throw new Error('Command does not have an execute or callback function.');
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
  }
};
