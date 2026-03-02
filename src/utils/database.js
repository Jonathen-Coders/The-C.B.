
const { db } = require('replit');

class Database {
  // Server settings
  static async getServerSettings(guildId) {
    const key = `settings_${guildId}`;
    return await db.get(key) || {};
  }

  static async setServerSettings(guildId, settings) {
    const key = `settings_${guildId}`;
    await db.set(key, settings);
  }

  // Command management
  static async getDisabledCommands(guildId) {
    const key = `commands_disabled_${guildId}`;
    return await db.get(key) || [];
  }

  static async setDisabledCommands(guildId, commands) {
    const key = `commands_disabled_${guildId}`;
    await db.set(key, commands);
  }

  // User data
  static async getUserData(guildId, userId) {
    const key = `user_${guildId}_${userId}`;
    return await db.get(key) || { balance: 0, lastDaily: null };
  }

  static async setUserData(guildId, userId, data) {
    const key = `user_${guildId}_${userId}`;
    await db.set(key, data);
  }

  // List all keys with a prefix
  static async listKeys(prefix) {
    return await db.list(prefix);
  }

  // Delete a key
  static async deleteKey(key) {
    await db.delete(key);
  }
}

module.exports = Database;
