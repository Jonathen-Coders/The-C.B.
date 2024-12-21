
const Database = require("@replit/database");
const db = new Database();

    


module.exports = {
    name: 'work',
    description: 'Work your job and earn currency.',
    options: [],
deleted: true,
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
           
            const userKey = `${interaction.guild.id}-${interaction.member.id}`;
            let user = await db.get(userKey);

            if (!user) {
                await interaction.editReply('You don\'t have a profile yet. Use the /job command to choose a job first!');
                return;
            }

            const selectedJob = user.selectedJob;
            if (!selectedJob) {
                await interaction.editReply('You need to select a job first using the /job command!');
                return;
            }

            // Define job payouts
            const jobPayouts = {
                miner: 36,
                builder: 25,
                pizza_delivery: 20,
            };

            const jobReward = jobPayouts[selectedJob];
            user.balance = (Number(user.balance) || 0) + jobReward;
            
            await db.set(userKey, user);

            await interaction.editReply(
                `You worked as a ${selectedJob} and earned ${jobReward} coins! Your new balance is ${user.balance}`
            );
        } catch (error) {
            console.error('Error with /work:', error);
            await interaction.editReply('An error occurred while processing your work.');
        }
    },
};
