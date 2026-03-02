
const { db } = require('@replit/database');

module.exports = (client) => {
  // Check birthdays every day at midnight
  setInterval(async () => {
    const today = new Date();
    const birthdays = await db.list('birthday_');

    for (const key of birthdays) {
      const userId = key.split('_')[1];
      const birthday = await db.get(key);

      if (birthday.month === today.getMonth() + 1 && birthday.day === today.getDate()) {
        try {
          const user = await client.users.fetch(userId);
          const guilds = client.guilds.cache.filter(g => g.members.cache.has(userId));

          for (const [_, guild] of guilds) {
            const birthdayRole = guild.roles.cache.find(r => r.name === 'Birthday');
            const member = await guild.members.fetch(userId);
            const channel = guild.systemChannel || guild.channels.cache.first();

            if (birthdayRole) {
              await member.roles.add(birthdayRole);
              // Remove role after 24 hours
              setTimeout(() => member.roles.remove(birthdayRole), 24 * 60 * 60 * 1000);
            }

            if (channel) {
              await channel.send(`🎉 Happy Birthday to ${user}! 🎂`);
            }
          }
        } catch (error) {
          console.error(`Error handling birthday for user ${userId}:`, error);
        }
      }
    }
  }, 24 * 60 * 60 * 1000); // Check every 24 hours
};
