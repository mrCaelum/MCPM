import discord_client from './controllers/discord/index';

if (process.env.DISCORD_BOT_TOKEN) {
    discord_client.login(process.env.DISCORD_BOT_TOKEN);
} else {
    console.log('DISCORD_BOT_TOKEN does not exists !');
}