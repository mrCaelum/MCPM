import { Client, Intents } from 'discord.js';
import command_handler from './commands';
import { register } from '../register';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', () => {
  if (client != null && client.user != null) {
    console.log(`Logged in as ${client.user.tag}!`);
  } else {
    console.log(`Unknown error`);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) command_handler(interaction);
  else if (interaction.isButton()) {
    if (interaction.customId === 'register') {
      interaction.user.send('Hello ' + interaction.user.username + ' !');
      await interaction.reply({ content: 'Check your private messages !', ephemeral: true });
    }
  }
});

client.on('message', async message => {
  if (message.author.bot) return;
  if (message.channel.type === 'DM') {
    register(message.author.id, message.content);
  }
});

export default client;