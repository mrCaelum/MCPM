import { MCUser, getUser } from '../models/mojang';
import mc_server from './minecraft';
import { db } from '../models/mongodb';

export async function register(discord_id: string, mc_username: string) : Promise<Error | void> {
  if ((await db.getUserByDiscord(discord_id)) != null) return new Error('User already registered !');
  const mc_account: MCUser | null = await getUser(mc_username);
  if (mc_account == null) return new Error('Invalid minecraft account !');
  const payload: db.User = {
    discord_id: discord_id,
    mc_username: mc_account.name
  };
  db.addUser(payload);
  mc_server.write('whitelist add ' + mc_account.name);
}

export async function unregister(discord_id: string) : Promise<Error | void> {
  const account: db.User | null = await db.getUserByDiscord(discord_id);
  if (account == null) return new Error('You are not registered !');
  db.rmUserByDiscord(discord_id);
  mc_server.write('whitelist remove ' + account.mc_username);
}