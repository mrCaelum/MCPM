import { MongoClient } from 'mongodb';

const aclient = new MongoClient('mongodb://localhost:27017').connect();

export namespace db {
  export interface User {
    discord_id: string;
    mc_username: string;
    op: boolean;
  }

  export async function getUserByDiscord(discord_id: string) : Promise<db.User | null> {
    const client = await aclient;
    const db = client.db('mcpm');
    const result = await db.collection('users').findOne({ discord_id: discord_id });
    if (result == null) return null;
    return {
      discord_id: result.discord_id,
      mc_username: result.mc_username,
      op: result.op
    };
  }

  export async function getUserByMinecraft(mc_username: string) : Promise<db.User | null> {
    const client = await aclient;
    const db = client.db('mcpm');
    const result = await db.collection('users').findOne({ mc_username: mc_username });
    if (result == null) return null;
    return {
      discord_id: result.discord_id,
      mc_username: result.mc_username,
      op: result.op
    };
  }

  export async function addUser(user: db.User) {
    const client = await aclient;
    const db = client.db('mcpm');
    await db.collection('users').insertOne(user);
  }

  export async function rmUserByDiscord(discord_id: string) {
    const client = await aclient;
    const db = client.db('mcpm');
    await db.collection('users').deleteOne({ discord_id: discord_id });
  }

  export async function setOp(discord_id: string, op: boolean) : Promise<boolean> {
    const client = await aclient;
    const db = client.db('mcpm');
    const result = await db.collection('users').updateOne({ discord_id: discord_id }, { $set: { op: op } });
    return !(!result || result.acknowledged === false || result.matchedCount === 0 || result.modifiedCount === 0);
  }
}