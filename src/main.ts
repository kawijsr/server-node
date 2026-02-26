import * as express from 'express';
import { Application } from './commons/application';

Application.build({ routes: require('./routes') }).use(express.json()).pipe((app) => {
  // Any thing for app Express instance
}).start();