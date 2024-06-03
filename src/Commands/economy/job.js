const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder,EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
module.exports = {
    name: 'job',
    description: 'Choose a job and earn currency.',
    options: [], // You can add options if needed (e.g., different job types)

    // The callback function handles the command logic
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: 'You can only run this command inside a server.',
                ephemeral: true,
            });
            return;
        }
        const query = {
            userId: interaction.member.id,
            guildId: interaction.guild.id,
          };
    let user = await User.findOne(query);
        if (!user) {
            // User doesn't have a profile, create one
            user = new User({
                userId: interaction.member.id,
                guildId: interaction.guild.id,
                balance: 0, // Set an initial balance
                lastDaily: new Date(), // Set the current date as last daily
                selectedJob: 'miner', // Default job (adjust as needed)
                jobPayouts: new Map([
                    ['miner', 36],
                    ['builder', 25],
                    ['pizza_delivery', 20],
                    // Add other jobs as needed
                ]),
            });
            await user.save();
            await interaction.deferReply();
            await interaction.editReply('You have been registered. Start earning currency by choosing a job!');
        }else{

        try {
            await interaction.deferReply();

            // Create buttons for job selection
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('miner')
                    .setLabel('Miner')
                    .setStyle('1'),
                new ButtonBuilder()
                    .setCustomId('builder')
                    .setLabel('Builder')
                    .setStyle('1'),
                new ButtonBuilder()
                    .setCustomId('pizza_delivery')
                    .setLabel('Pizza Delivery')
                    .setStyle('1')
            );

            // Display an embed with job selection instructions
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Choose a Job')
                .setDescription('Click a button to select a job.');

            // Send the initial message with buttons
            await interaction.editReply({ embeds: [embed], components: [row] });

            // Handle button interactions
            client.on('interactionCreate', async (buttonInteraction) => {
                if (!buttonInteraction.isButton()) return;
                

                const { customId, member } = buttonInteraction;

                // Define job payouts (you can adjust these values)
                const jobPayouts = {
                    miner: 36,
                    builder: 25,
                    pizza_delivery: 20,
                };

                // Assign currency based on the selected job
                const jobReward = jobPayouts[customId];
                user.selectedJob = customId;
                user.jobPayouts = user.jobPayouts || {}; // Initialize if not already set
                user.jobPayouts[customId] = jobReward;
                await user.save();

                // Send an ephemeral reply to the user
                await buttonInteraction.reply({
                    content: `You have chosen the ${customId} job!`,
                    ephemeral: true,
                });
            });
        } catch (error) {
            console.error('Error with /job:', error);
            interaction.editReply('An error occurred while processing your job.');
             }
         }
    }
};
