const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Replies with your input')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to say')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        await interaction.reply({ content: `Message sent: ${message}`, ephemeral: true });
        await interaction.channel.send({ content: message });
    },
};
