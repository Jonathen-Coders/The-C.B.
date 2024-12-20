
const { Client, GuildMember } = require('discord.js');
const { db } = require('replit');

/**
 * @param {Client} client
 * @param {GuildMember} member
 */
module.exports = async (client, member) => {
  try {
    let guild = member.guild;
    if (!guild) return;

    const dbKey = `autorole_${guild.id}`;
    const roleId = await db.get(dbKey);
    if (!roleId) return;

    await member.roles.add(roleId);
  } catch (error) {
    console.log(`Error giving role automatically: ${error}`);
  }
};
