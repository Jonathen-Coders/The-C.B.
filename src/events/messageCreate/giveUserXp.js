
const { Client, Message } = require('discord.js');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const { db } = require('replit');
const cooldowns = new Set();

function getRandomXp(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

  const xpToGive = getRandomXp(5, 15);
  const levelKey = `${message.guild.id}-${message.author.id}`;

  try {
    let level = db[levelKey];

    if (level) {
      level.xp += xpToGive;

      if (level.xp > calculateLevelXp(level.level)) {
        level.xp = 0;
        level.level += 1;

        message.channel.send(`${message.member} you have leveled up to **level ${level.level}**.`);
      }

      db[levelKey] = level;
      
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    } else {
      // create new level
      db[levelKey] = {
        userId: message.author.id,
        guildId: message.guild.id,
        xp: xpToGive,
        level: 1,
      };

      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    }
  } catch (error) {
    console.log(`Error giving xp: ${error}`);
  }
};
