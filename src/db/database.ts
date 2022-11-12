import * as mongoose from 'mongoose';
import { confirmSeed } from './seeder';

const MONGODB_URI = process.env.MONGODB_URI as string;

mongoose.set("bufferCommands", false);

// mongoose.connect(
//   MONGODB_URI,
//   {},
//   (err) => {
//     if (err) {
//       console.log("Error connecting to db: ", err);
//     } else {
//       console.log(`Connected to MongoDB @ ${process.env.MONGODB_URI}`);
//       confirmSeed();
//     }
//   }
// );

export async function database() {
  try {
    const cluster = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Cluster running on ${cluster.connection.port}`)
    confirmSeed();
  } catch (err) {
    console.error("Error connecting to db: ", err);
  }
};
