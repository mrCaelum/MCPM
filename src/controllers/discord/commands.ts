import { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, CacheType } from 'discord.js';
import register from '../register';
import { db } from '../../models/mongodb';

function _embed_register_message(button_content: string, message_content: string, message_title: string | null) {
  const embed = new MessageEmbed().setColor('#0099ff').setDescription(message_content);
  if (message_title != null) {
    embed.setTitle(message_title);
  }
  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('register')
        .setLabel(button_content)
        .setStyle('PRIMARY'),
    );
  return { ephemeral: false, embeds: [embed], components: [row] };
}

async function _whoami(interaction: CommandInteraction<CacheType>) {
  const result: db.User | null = await db.getUserByDiscord(interaction.user.id);
  if (result == null) {
    await interaction.reply({ content: 'Not registered yet, type \"/register\" to register your account', ephemeral: true });
  } else {
    await interaction.reply({ content: 'Hello ' + interaction.user.username + ' ! Your account is actually linked to \"' + result.mc_account.name + '\" in minecraft :)', ephemeral: true });
  }
}

async function _register(interaction: CommandInteraction<CacheType>) {
  const minecraft_username = interaction.options.getString('minecraft_username');
  if (minecraft_username != null) {
    const err: Error | void = await register(interaction.user.id, minecraft_username);
    await interaction.reply({ content: (!err) ? 'Registration successfuly completed !' : err.toString(), ephemeral: true });
  } else {
    await interaction.reply({ content: 'minecraft_username is required !', ephemeral: true });
  }
}

async function _create(interaction: CommandInteraction<CacheType>) {
  if (interaction.options.getSubcommand(true) === 'register') {
    const button_content = interaction.options.getString('button_content');
    const message_content = interaction.options.getString('message_content');
    const message_title = interaction.options.getString('message_title');
    if (button_content == null || message_content == null) {
      await interaction.reply({ content: 'Invalid arguments', ephemeral: true });
    } else {
      // interaction.channel.send(_embed_register_message(button_content, message_content, message_title));
      await interaction.reply({ content: 'Message successfuly created !', ephemeral: true });
    }
  } else {
    await interaction.reply({ content: 'Invalid arguments', ephemeral: true });
  }
}

export default async function(interaction: CommandInteraction<CacheType>) : Promise<void> {
  const handlers: { key: string, ptr: (interaction: CommandInteraction<CacheType>) => Promise<void> }[] = [
    { key: 'whoami',   ptr: _whoami   },
    { key: 'register', ptr: _register },
    { key: 'create',   ptr: _create   }
  ];

  for (let handler of handlers) {
    if (interaction.commandName === handler.key) {
      return await handler.ptr(interaction);
    }
  }
  await interaction.reply({ content: 'Invalid argument', ephemeral: true });
}