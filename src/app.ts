import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import * as mongoose from 'mongoose';
import { confirmSeed } from './db/seeder';

const MONGODB_URI = process.env.MONGODB_URI as string;

mongoose.set("bufferCommands", false);

mongoose.connect(
  MONGODB_URI,
  {},
  (err) => {
    if (err) {
      console.log("Error connecting to db: ", err);
    } else {
      console.log(`Connected to MongoDB @ ${process.env.MONGODB_URI}`);
      confirmSeed();
    }
  }
);

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

export default app;
