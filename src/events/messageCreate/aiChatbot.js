
const { Client, Message } = require('discord.js');
const { db } = require('replit');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory conversation history per channel (up to MAX_HISTORY messages)
const conversationHistory = new Map();
const MAX_HISTORY = 20;

/**
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.inGuild() || message.author.bot) return;

  try {
    const dbKey = `aichannel_${message.guild.id}`;
    const aiChannelId = await db.get(dbKey);

    if (!aiChannelId || message.channel.id !== aiChannelId) return;

    if (!process.env.OPENAI_API_KEY) {
      await message.reply('⚠️ The AI chatbot is not configured. Please contact an administrator to set up the `OPENAI_API_KEY` environment variable.');
      return;
    }

    const historyKey = `${message.guild.id}_${message.channel.id}`;

    if (!conversationHistory.has(historyKey)) {
      conversationHistory.set(historyKey, []);
    }

    const history = conversationHistory.get(historyKey);

    // Add the user's message to history
    history.push({
      role: 'user',
      content: `${message.author.displayName}: ${message.content}`,
    });

    // Keep history within limit
    while (history.length > MAX_HISTORY) {
      history.shift();
    }

    await message.channel.sendTyping();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a friendly and helpful AI chatbot in the Discord server "${message.guild.name}". Keep responses concise and engaging. You can use Discord markdown formatting (bold, italics, code blocks, etc.). User messages include the sender's display name before a colon.`,
        },
        ...history,
      ],
    });

    const reply = completion.choices[0].message.content;

    // Save the assistant's response to history
    history.push({ role: 'assistant', content: reply });

    await message.reply(reply);
  } catch (error) {
    console.log(`Error in AI chatbot: ${error}`);

    if (error?.status === 401) {
      await message.reply('⚠️ Invalid OpenAI API key. Please contact an administrator.');
    } else if (error?.status === 429) {
      await message.reply('⚠️ The AI is rate limited right now. Please try again in a moment.');
    } else if (error?.status === 500) {
      await message.reply('⚠️ The AI service is experiencing issues. Please try again later.');
    }
  }
};
