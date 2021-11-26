import discord_client from './controllers/discord/index';
import * as config from './config.json';

discord_client.login(config.token);