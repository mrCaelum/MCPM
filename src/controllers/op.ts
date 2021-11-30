import mc_server from './minecraft';
import { db } from '../models/mongodb';

export async function op(discord_id: string) : Promise<Error | void> {
  const account: db.User | null = await db.getUserByDiscord(discord_id);
  if (account == null) return new Error('User not registered !');
  db.setOp(account.discord_id, true);
  mc_server.write('op ' + account.mc_username);
}

export async function deop(discord_id: string) : Promise<Error | void> {
  const account: db.User | null = await db.getUserByDiscord(discord_id);
  if (account == null) return new Error('User not registered !');
  db.setOp(discord_id, false);
  mc_server.write('deop ' + account.mc_username);
}