const User = require('../../models/User');

module.exports = {
    name: 'work',
    description: 'Work your job and earn currency.',
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

        try {
            await interaction.deferReply();
           
            // Fetch the user's profile (replace with your actual User model)
            const query = {
                userId: interaction.member.id,
                guildId: interaction.guild.id,
            };
            let user = await User.findOne(query);

            if (!user) {
                interaction.editReply('You don\'t have a profile yet. Start earning currency by choosing a job!');
                return;
            }

            const selectedJob = user.selectedJob;

            // Retrieve the job reward from the map
            const jobReward = user.jobPayouts.get(selectedJob);
    

            // Update the user's balance
            user.balance += jobReward;
            await user.save();

            interaction.editReply(
                `You worked as a ${selectedJob} and earned ${jobReward} coins! Your new balance is ${user.balance}`
            );
        } catch (error) {
            console.error('Error with /work:', error);
            interaction.editReply('An error occurred while processing your work.');
        }
    },
};
