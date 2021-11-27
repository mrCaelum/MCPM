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
        new SlashCommandBuilder().setName('whoami').setDescription('Tells you who you are'),
        new SlashCommandBuilder().setName('register').setDescription('Register your minecraft account to the server').addStringOption(option => option.setName('minecraft_username').setDescription('The minecraft account to link').setRequired(true)),
        new SlashCommandBuilder().setName('create').setDescription('Create a new link instance')
            .addSubcommand(option => option.setName('register').setDescription('Create a instance of a register message')
                .addStringOption(stropt => stropt.setName('button_content').setDescription('Content of the button').setRequired(true))
                .addStringOption(stropt => stropt.setName('message_content').setDescription('Content of the message').setRequired(true))
                .addStringOption(stropt => stropt.setName('message_title').setDescription('Title of the message').setRequired(false))
            ),
    ]
        .map(command => command.toJSON());

    const rest = new REST({ version: '9' }).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}