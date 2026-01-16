const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.prefixCommands = new Collection();
client.slashCommands = new Collection();

const prefixCommandsPath = path.join(__dirname, 'commands');
const prefixCommandFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
for (const file of prefixCommandFiles) {
    const command = require(path.join(prefixCommandsPath, file));
    client.prefixCommands.set(file.replace('.js', ''), command);
}

const slashCommandsPath = path.join(__dirname, 'commands', 'slashCommands');
if (fs.existsSync(slashCommandsPath)) {
    const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
    for (const file of slashCommandFiles) {
        let command = require(path.join(slashCommandsPath, file));
        // Support both default and direct exports
        if (command.default) command = command.default;
        client.slashCommands.set(command.data.name, command);
    }
}

client.once('clientReady', async () => {
    console.log(`Logged in as @${client.user.tag}`);
    const data = client.slashCommands.map(cmd => cmd.data.toJSON());
    try {
        await client.application.commands.set(data);
        console.log('Slash commands registered globally.');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
        await command(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command.');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
    }
});

client.login(process.env.TOKEN);