import * as mongoose from 'mongoose';
import { confirmSeed } from './seeder';

const MONGODB_URI = process.env.MONGODB_URI as string;
const dbOptions = {
  autoIndex: false,
}

mongoose.set("bufferCommands", false);

export async function database() {
  try {
    const cluster = await mongoose.connect(MONGODB_URI, dbOptions);
    console.log(`MongoDB Cluster running on ${cluster.connection.port}`)
    confirmSeed();
  } catch (err) {
    console.error("Error connecting to db: ", err);
  }
};
