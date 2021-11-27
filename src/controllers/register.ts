import { MCUser, getUser } from '../models/mojang';
import { db } from '../models/mongodb';

export default async function register(discord_id: string, mc_username: string) : Promise<Error | void> {
  if ((await db.getUserByDiscord(discord_id)) != null) return new Error('User already registered !');
  const mc_account: MCUser | null = await getUser(mc_username);
  if (mc_account == null) return new Error('Invalid minecraft account !');
  const payload: db.User = {
    discord_id: discord_id,
    mc_account: mc_account
  };
  db.addUser(payload);
}