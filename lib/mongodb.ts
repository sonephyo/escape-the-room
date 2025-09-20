import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    db = client.db(process.env.MONGODB_NAME!);
  }
  
  return db;
}