import { MessageEmbed, TextChannel } from 'discord.js';
import client from '.';
import { db } from '../../models/mongodb'

var CHANNEL: TextChannel | undefined;

function _embed_connection_message(username: string, connect: boolean) {
  const embed = new MessageEmbed()
    .setAuthor(username)
    .setDescription(connect ? 'Joined the server' : 'Left the server')
    .setColor(connect ? '#FFE229' : '#FF621F');
  return { ephemeral: false, embeds: [embed] };
}

function _embed_message(username: string, message: string) {
  const embed = new MessageEmbed()
    .setAuthor(username)
    .setDescription(message)
    .setColor('#D6E8FF');
  return { ephemeral: false, embeds: [embed] };
}

function _embed_achivement(username: string, achivement: string) {
  const embed = new MessageEmbed()
    .setAuthor(username)
    .setDescription('Has made the advancement ' + achivement)
    .setColor('#B747D7');
  return { ephemeral: false, embeds: [embed] };
}


export function set_channel(channel_id: string) : Error | void {
  const channel = client.channels.cache.get(channel_id);
  if (!channel || !channel.isText()) return new Error();
  CHANNEL = channel as TextChannel;
}

export function get_channel_id() : string | null {
  if (CHANNEL !== undefined) {
    return CHANNEL.id;
  }
  return null;
}

export function connection_handler(username: string, connect: boolean) : void {
  if (CHANNEL !== undefined) {
    CHANNEL.send(_embed_connection_message(username, connect));
  }
}

export function message_handler(username: string, message: string) : void {
  if (CHANNEL !== undefined) {
    CHANNEL.send(_embed_message(username, message));
  }
}

export async function advancement_handler(username: string, advancement: string) : Promise<void> {
  const achivements = [
    { name: 'Stone Age', id: '915194601407647775' }
  ];
  if (CHANNEL !== undefined) {
    if (process.env.GUILD_ID !== undefined) {
      const account: db.User | null = await db.getUserByMinecraft(username);
      console.log(account);
      if (account !== null) {
        for (let achivement of achivements) {
          if (advancement === achivement.name) {
            const guild = client.guilds.cache.get(process.env.GUILD_ID);
            if (guild !== undefined) {
              const user = guild.members.cache.get(account.discord_id);
              const role = guild.roles.cache.get(achivement.id);
              if (user !== undefined && role !== undefined) {
                user.roles.add(role);
              } else {
                console.log('Error: Invalid role or user');
              }
            } else {
              console.log('Error: Guild not found')
            }
            break;
          }
        }
      } else {
        console.log('Error: User not found');
      }
    }
    CHANNEL.send(_embed_achivement(username, advancement));
  }
}