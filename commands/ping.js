const { ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = async (client, message) => {
    try {
       
        const reply = await message.channel.send('<a:loading:1402419725673435146> Pinging...');

      
        const discordLatency = reply.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);

        const botStartTimestamp = Math.floor((Date.now() - client.uptime) / 1000);
        let container = new ContainerBuilder()
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent(
                        `<:Ping:1288593730416283648> **Latency:** \`${apiLatency} ms\`\n<:online:1327780491377508362> **Uptime:** <t:${botStartTimestamp}:R>`
                    ),
            )
            .addActionRowComponents(
                actionRow => actionRow
                    .setComponents(
                        new ButtonBuilder()
                            .setCustomId('refresh_ping')
                            .setLabel('Refresh')
                            .setEmoji('1402419725673435146')
                            .setStyle(ButtonStyle.Secondary)
                    ),
            );

        await reply.edit({
            content: ' ',
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });

        const collector = reply.createMessageComponentCollector({ componentType: 2, time: 60000 });
        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: '<:Warning:1286839356719370292> You cannot use this.', ephemeral: true });
            }

            const newDiscordLatency = reply.createdTimestamp - message.createdTimestamp;
            const newApiLatency = Math.round(message.client.ws.ping);
            const newBotStartTimestamp = Math.floor((Date.now() - client.uptime) / 1000);
            container = new ContainerBuilder()
                .addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent(
                            `<:Ping:1288593730416283648> **Latency:** \`${newApiLatency} ms\`\n<:online:1327780491377508362> **Uptime:** <t:${newBotStartTimestamp}:R>`
                        ),
                )
                .addActionRowComponents(
                    actionRow => actionRow
                        .setComponents(
                            new ButtonBuilder()
                                .setCustomId('refresh_ping')
                                .setLabel('Refresh')
                                .setEmoji('1402419725673435146')
                                .setStyle(ButtonStyle.Secondary)
                        ),
                );
            await interaction.update({
                content: ' ',
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
        });

        collector.on('end', async () => {
            const disabledContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent(
                           `<:Ping:1288593730416283648> **Latency:** \`${apiLatency} ms\`\n<:online:1327780491377508362> **Uptime:** <t:${botStartTimestamp}:R>`  
                        ),
                )
                .addActionRowComponents(
                    actionRow => actionRow
                        .setComponents(
                            new ButtonBuilder()
                                .setCustomId('refresh_ping')
                                .setLabel('Refresh')
                                .setEmoji('1402419725673435146')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        ),
                );
            await reply.edit({
                content: ' ',
                components: [disabledContainer],
                flags: MessageFlags.IsComponentsV2,
            });
        });
    } catch (error) {
        console.error('Error fetching ping data:', error);
        if (!message.deletable) {
            await message.channel.send('<:Warning:1286839356719370292> An error occurred while fetching the data. Please try again later.');
        }
    }
};