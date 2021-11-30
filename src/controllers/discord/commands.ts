import { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, CacheType } from 'discord.js';
import { db } from '../../models/mongodb';
import { register, unregister } from '../register';
import { op, deop } from '../op';
import mc_server from '../minecraft';
import { set_channel } from './minecraft_link';

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

async function _stop(interaction: CommandInteraction<CacheType>) {
  const self: db.User | null = await db.getUserByDiscord(interaction.user.id);
  if (!self || self.op === false) return await interaction.reply({ content: 'Insufficient permissions to run this command !', ephemeral: true });
  mc_server.write('stop');
  await interaction.reply({ content: 'Stopping the server...', ephemeral: true });
  process.exit(0);
}

async function _whoami(interaction: CommandInteraction<CacheType>) {
  const result: db.User | null = await db.getUserByDiscord(interaction.user.id);
  if (result == null) {
    await interaction.reply({ content: 'Not registered yet, type \"/register\" to register your account', ephemeral: true });
  } else {
    await interaction.reply({ content: 'Hello ' + interaction.user.username + ' ! Your account is actually linked to \"' + result.mc_username + '\" in minecraft :)', ephemeral: true });
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

async function _unregister(interaction: CommandInteraction<CacheType>) {
  const err: Error | void = await unregister(interaction.user.id);
  await interaction.reply({ content: (!err) ? 'Unregistration successfuly completed !' : err.toString(), ephemeral: true });
}

async function _op(interaction: CommandInteraction<CacheType>) {
  const self: db.User | null = await db.getUserByDiscord(interaction.user.id);
  if (!self || self.op === false) return await interaction.reply({ content: 'Insufficient permissions to run this command !', ephemeral: true });
  const user = interaction.options.getString('user');
  if (!user || user.length < 5) return await interaction.reply({ content: 'Invalid argument !', ephemeral: true });
  const user_id = user.slice(3, -1);
  const target: db.User | null = await db.getUserByDiscord(user_id);
  if (target === null) return await interaction.reply({ content: 'User not registed !', ephemeral: true });
  if (target.op === true) return await interaction.reply({ content: 'The target user is already op !', ephemeral: true });
  op(user_id);
  await interaction.reply({ content: user + 'is now an operator !', ephemeral: true });
}

async function _deop(interaction: CommandInteraction<CacheType>) {
  const self: db.User | null = await db.getUserByDiscord(interaction.user.id);
  if (!self || self.op === false) return await interaction.reply({ content: 'Insufficient permissions to run this command !', ephemeral: true });
  const user = interaction.options.getString('user');
  if (!user || user.length < 5) return await interaction.reply({ content: 'Invalid argument !', ephemeral: true });
  const user_id = user.slice(3, -1);
  const target: db.User | null = await db.getUserByDiscord(user_id);
  if (target === null) return await interaction.reply({ content: 'User not registed !', ephemeral: true });
  if (target.op === false) return await interaction.reply({ content: 'The target user is already not op !', ephemeral: true });
  deop(user_id);
  await interaction.reply({ content: user + 'is no longer an operator !', ephemeral: true });
}

async function _set(interaction: CommandInteraction<CacheType>) {
  if (interaction.options.getSubcommand(true) === 'chat_channel') {
    const self: db.User | null = await db.getUserByDiscord(interaction.user.id);
    if (!self || self.op === false) return await interaction.reply({ content: 'Insufficient permissions to run this command !', ephemeral: true });
    set_channel(interaction.channelId);
    await interaction.reply({ content: 'Current channel successfuly defined as active chat', ephemeral: true });
  } else {
    await interaction.reply({ content: 'Invalid command !', ephemeral: true });
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
    { key: 'stop',       ptr: _stop       },
    { key: 'whoami',     ptr: _whoami     },
    { key: 'register',   ptr: _register   },
    { key: 'unregister', ptr: _unregister },
    { key: 'op',         ptr: _op         },
    { key: 'deop',       ptr: _deop       },
    { key: 'set',        ptr: _set        },
    { key: 'create',     ptr: _create     }
  ];

  for (let handler of handlers) {
    if (interaction.commandName === handler.key) {
      return await handler.ptr(interaction);
    }
  }
  await interaction.reply({ content: 'Invalid argument', ephemeral: true });
}