const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
    console.log('DISCORD_BOT_TOKEN does not exists !');
} else if (!clientId) {
    console.log('CLIENT_ID does not exists !');
} else if (!guildId) {
    console.log('GUILD_ID does not exists !');
} else {
    const commands = [
        new SlashCommandBuilder().setName('stop').setDescription('Stops the server'),
        new SlashCommandBuilder().setName('whoami').setDescription('Tells you who you are'),
        new SlashCommandBuilder().setName('register').setDescription('Register your minecraft account to the server').addStringOption(option => option.setName('minecraft_username').setDescription('The minecraft account to link').setRequired(true)),
        new SlashCommandBuilder().setName('unregister').setDescription('Unregister you from the server'),
        new SlashCommandBuilder().setName('set').setDescription('Set command')
            .addSubcommand(option => option.setName('chat_channel').setDescription('Set the current channel to the active chat channel'))
            .addSubcommand(option => option.setName('log_channel').setDescription('Set the current channel to the active log channel'))
    ]
        .map(command => command.toJSON());

    const rest = new REST({ version: '9' }).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}