
const raidProtectionData = new Map();

class RaidProtection {
  static checkRaid(guildId, threshold = 5, timeWindow = 10000) {
    const now = Date.now();
    const joins = raidProtectionData.get(guildId) || [];
    
    // Clean old entries
    const recentJoins = joins.filter(time => now - time < timeWindow);
    
    // Add new join
    recentJoins.push(now);
    raidProtectionData.set(guildId, recentJoins);
    
    return recentJoins.length >= threshold;
  }

  static clearData(guildId) {
    raidProtectionData.delete(guildId);
  }
}

module.exports = RaidProtection;
