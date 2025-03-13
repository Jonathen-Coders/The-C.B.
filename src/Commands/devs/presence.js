const { ApplicationCommandOptionType, ActivityType } = require("discord.js");

module.exports = {
    devOnly: true,
    name: "presence",
    description: "Sets the bot's presence.",
    options: [
        {
            name: "status",
            description: "The status",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Default",
                    value: "default",
                },
                {
                    name: "Online",
                    value: "online",
                },
                {
                    name: "Idle",
                    value: "idle",
                },
                {
                    name: "Do Not Disturb",
                    value: "dnd",
                },
                {
                    name: "Invisible",
                    value: "invisible",
                },
            ],
        },
        {
            name: "activity",
            description: "The activity type",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: "Playing",
                    value: "Playing",
                },
                {
                    name: "Watching",
                    value: "Watching",
                },
                {
                    name: "Listening",
                    value: "Listening",
                },
                {
                    name: "Streaming",
                    value: "Streaming",
                },
                {
                    name: "Competing",
                    value: "Competing",
                },
            ],
        },
        {
            name: "message",
            description: "The status message",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    callback: async (client, interaction) => {
        try {
            // Get the status, activity type, and status message from the command options
            const status = interaction.options.getString("status");
            
            // Handle default status
            if (status === "default") {
                await client.user.setPresence({
                    activities: [],
                    status: "online"
                });
                
                await interaction.reply({
                    content: `✅ Bot's presence reset to default`,
                    ephemeral: true,
                });
                console.log(`Bot's presence reset to default`);
                return;
            }
            
            const activityType = interaction.options.getString("activity");
            const statusMessage = interaction.options.getString("message");

            // Set the bot's presence
            await client.user.setPresence({
                activities: activityType && statusMessage ? [
                    {
                        name: statusMessage,
                        type: ActivityType[activityType],
                    },
                ] : [],
                status: status, // online, idle, dnd, or invisible
            });

            await interaction.reply({
                content: `✅ Bot's presence set to: ${status}${activityType && statusMessage ? ` - ${activityType} ${statusMessage}` : ''}`,
                ephemeral: true,
            });
            console.log(
                `Bot's presence set to: ${status}${activityType && statusMessage ? ` - ${activityType} ${statusMessage}` : ''}`,
            );
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content:
                    "An error occurred while setting the presence: " +
                    error.message,
                ephemeral: true,
            });
        }
    },
};
