const { Client, GuildMember } = require('discord.js');
const { db } = require('replit');
const RaidProtection = require('../../utils/RaidProtection');

/**
 * @param {Client} client
 * @param {GuildMember} member
 */
module.exports = async (client, member) => {
  try {
    let guild = member.guild;
    if (!guild) return;

    // Check for raid
    const isRaid = RaidProtection.checkRaid(member.guild.id, 5, 10000);
    if (isRaid) {
      try {
        await member.guild.channels.cache
          .find(channel => channel.name === 'mod-logs' || channel.name === 'logs')
          ?.send(`🚨 **RAID DETECTED!** Multiple users joining rapidly. Last join: ${member.user.tag}`);

        await member.kick('Raid protection - Too many joins in short time');
        return;
      } catch (error) {
        console.error('Error in raid protection:', error);
      }
    }

    const dbKey = `autorole_${guild.id}`;
    const roleId = await db.get(dbKey);
    if (!roleId) return;

    await member.roles.add(roleId);
  } catch (error) {
    console.log(`Error giving role automatically: ${error}`);
  }
};