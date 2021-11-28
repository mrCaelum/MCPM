import { MongoClient } from 'mongodb';

const aclient = new MongoClient('mongodb://localhost:27017').connect();

export namespace db {
  export interface User {
    discord_id: string;
    mc_account: {
      uuid: string;
      name: string;
    }
  }

  export async function getUserByDiscord(discord_id: string) : Promise<db.User | null> {
    const client = await aclient;
    const db = client.db('mcpm');
    const result = await db.collection('users').findOne({ discord_id: discord_id });
    if (result == null) return null;
    return {
      discord_id: result.discord_id,
      mc_account: result.mc_account
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
}