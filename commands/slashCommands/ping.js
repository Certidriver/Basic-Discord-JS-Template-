const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and shows latency.'),
    async execute(interaction) {
        const apiLatency = Math.round(interaction.client.ws.ping);
        const botStartTimestamp = Math.floor((Date.now() - interaction.client.uptime) / 1000);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('refresh_ping')
                .setLabel('Refresh')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            content: `🏓 **Latency:** \`${apiLatency} ms\`\n🟢 **Uptime:** <t:${botStartTimestamp}:R>`,
            components: [row],
            ephemeral: false
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.customId === 'refresh_ping' && i.user.id === interaction.user.id,
            time: 60000
        });

        collector.on('collect', async i => {
            const newApiLatency = Math.round(interaction.client.ws.ping);
            const newBotStartTimestamp = Math.floor((Date.now() - interaction.client.uptime) / 1000);
            await i.update({
                content: `🏓 **Latency:** \`${newApiLatency} ms\`\n🟢 **Uptime:** <t:${newBotStartTimestamp}:R>`,
                components: [row]
            });
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('refresh_ping')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );
            try {
                const msg = await interaction.fetchReply();
                await msg.edit({ components: [disabledRow] });
            } catch (e) {}
        });
    },
};