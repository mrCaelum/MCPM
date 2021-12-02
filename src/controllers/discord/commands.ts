import { CommandInteraction, CacheType, GuildMember, GuildMemberRoleManager } from 'discord.js';
import { db } from '../../models/mongodb';
import { register, unregister } from '../register';
import mc_server from '../minecraft';
import { set_chat_channel, set_log_channel } from './minecraft_link';

function _has_role(member: GuildMember, role_id: string | undefined) : boolean {
  if (role_id === undefined) return false;
  if (member.roles.cache.find(role => role.id === role_id) !== undefined) {
    return true;
  }
  return false;
}

async function _stop(interaction: CommandInteraction<CacheType>) {
  const self: db.User | null = await db.getUserByDiscord(interaction.user.id);
  if (!self || !_has_role(interaction.member as GuildMember, process.env.ADMIN_ROLE)) return await interaction.reply({ content: 'Insufficient permissions to run this command !', ephemeral: true });
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
    if (err) {
      await interaction.reply({ content: err.toString(), ephemeral: true });
    } else {
      if (interaction.guild !== null && process.env.PLAYER_ROLE !== undefined) {
        const role = interaction.guild.roles.cache.find(role => role.id === process.env.PLAYER_ROLE);
        if (role !== undefined) {
          (interaction.member as GuildMember).roles.add(role);
        }
      }
      if (_has_role(interaction.member as GuildMember, process.env.ADMIN_ROLE)) {
        mc_server.write('op ' + minecraft_username);
      }
      await interaction.reply({ content: 'Registration successfuly completed !', ephemeral: true });
    }
  } else {
    await interaction.reply({ content: 'minecraft_username is required !', ephemeral: true });
  }
}

async function _unregister(interaction: CommandInteraction<CacheType>) {
  const err: Error | void = await unregister(interaction.user.id);
  await interaction.reply({ content: (!err) ? 'Unregistration successfuly completed !' : err.toString(), ephemeral: true });
}

async function _set(interaction: CommandInteraction<CacheType>) {
  if (interaction.options.getSubcommand(true) === 'chat_channel') {
    if (!_has_role(interaction.member as GuildMember, process.env.ADMIN_ROLE)) return await interaction.reply({ content: 'Insufficient permissions to run this command !', ephemeral: true });
    set_chat_channel(interaction.channelId);
    await interaction.reply({ content: 'Current channel successfuly defined as active chat channel', ephemeral: true });
  } else if (interaction.options.getSubcommand(true) === 'log_channel') {
    if (!_has_role(interaction.member as GuildMember, process.env.ADMIN_ROLE)) return await interaction.reply({ content: 'Insufficient permissions to run this command !', ephemeral: true });
    set_log_channel(interaction.channelId);
    await interaction.reply({ content: 'Current channel successfuly defined as active log channel', ephemeral: true });
  } else {
    await interaction.reply({ content: 'Invalid command !', ephemeral: true });
  }
}

export default async function(interaction: CommandInteraction<CacheType>) : Promise<void> {
  const handlers: { key: string, ptr: (interaction: CommandInteraction<CacheType>) => Promise<void> }[] = [
    { key: 'stop',       ptr: _stop       },
    { key: 'whoami',     ptr: _whoami     },
    { key: 'register',   ptr: _register   },
    { key: 'unregister', ptr: _unregister },
    { key: 'set',        ptr: _set        }
  ];

  for (let handler of handlers) {
    if (interaction.commandName === handler.key) {
      return await handler.ptr(interaction);
    }
  }
  await interaction.reply({ content: 'Invalid argument', ephemeral: true });
}