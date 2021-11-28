import { MessageEmbed } from 'discord.js';
import client from '.';
import { TextChannel } from 'discord.js';
import mc_server from '../minecraft';

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