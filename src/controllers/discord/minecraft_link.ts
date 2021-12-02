import { MessageEmbed, TextChannel } from 'discord.js';
import client from '.';
import { db } from '../../models/mongodb'

var CHAT_CHANNEL: TextChannel | undefined;
var LOG_CHANNEL: TextChannel | undefined;

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


export function set_chat_channel(channel_id: string) : Error | void {
  const channel = client.channels.cache.get(channel_id);
  if (!channel || !channel.isText()) return new Error();
  CHAT_CHANNEL = channel as TextChannel;
}

export function set_log_channel(channel_id: string) : Error | void {
  const channel = client.channels.cache.get(channel_id);
  if (!channel || !channel.isText()) return new Error();
  LOG_CHANNEL = channel as TextChannel;
}

export function get_channel_id() : string | null {
  if (CHAT_CHANNEL !== undefined) {
    return CHAT_CHANNEL.id;
  }
  return null;
}

export function connection_handler(username: string, connect: boolean) : void {
  if (CHAT_CHANNEL !== undefined) {
    CHAT_CHANNEL.send(_embed_connection_message(username, connect));
  }
}

export function message_handler(username: string, message: string) : void {
  if (CHAT_CHANNEL !== undefined) {
    CHAT_CHANNEL.send(_embed_message(username, message));
  }
}

export async function advancement_handler(username: string, advancement: string) : Promise<void> {
  const achivements = [
    { name: 'Return to Sender',        id: '915198430027059210' },
    { name: 'Hot Tourist Destination', id: '915198738824306720' },
    { name: 'A Balanced Diet',         id: '915200003880935424' },
    { name: 'Serious Dedication',      id: '915199869868736562' },
    { name: 'Sniper Duel',             id: '915199571246841897' },
    { name: 'Bullseye',                id: '915199571246841897' },
    { name: 'Two Birds, One Arrow',    id: '915199252706263090' },
    { name: 'Arbalistic',              id: '915199521531768862' },
    { name: 'Hero of the Village',     id: '915199156937707530' },
    { name: 'Two by two',              id: '915199700255248414' },
    { name: 'Cover Me in Debris',      id: '915198662760595456' },
    { name: 'Subspace Bubble',         id: '915198500134862878' },
    { name: 'A Complete Catalogue',    id: '915199773533937715' },
    { name: 'A Furious Cocktail',      id: '915198965564178443' },
    { name: 'Uneasy Alliance',         id: '915198611468451890' },
    { name: 'Monsters Hunted',         id: '915279323034951710' },
    { name: 'Adventuring Time',        id: '915199397590085633' },
    { name: 'How did we get here',     id: '915198148312440834' }
  ];
  if (CHAT_CHANNEL !== undefined) {
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
    CHAT_CHANNEL.send(_embed_achivement(username, advancement));
  }
}

export function command_logger(line: string) {
  if (LOG_CHANNEL !== undefined) {
    LOG_CHANNEL.send(line);
  }
}