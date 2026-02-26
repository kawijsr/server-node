import * as express from 'express';
import { Configurations } from './configurations';
import {Express} from "express";

export class Application {
  private readonly port = Configurations.get('PORT') || 3000;
  private readonly app: Express;
  private options: ApplicationOptions;

  constructor() {
    this.app = express();
  }

  static build(options?: ApplicationOptions) {
    const newApp = new Application();
    newApp.options = options || {} as ApplicationOptions;
    return newApp;
  }

  use(middleware: any) {
    this.app.use(middleware);
    return this;
  }

  pipe(func: (self: Express) => void) {
    typeof func === 'function' && func(this.app);
    return this;
  }

  private router() {
    if (!this.options.routes) {
      console.warn('Routes not provided. Consider using Application.build({ routes: [Class] | require("path") })');
      return;
    }
    Object.values(this.options.routes).forEach((route: any) => (new route()['instance'](this.app)));
  }

  start(callback?: () => void) {
    // Routing
    this.router();
    this.app.listen(this.port, () => {
      console.log(`Listening on port -> ${this.port}`);
      callback && callback();
    });
    return this;
  }
}

interface ApplicationOptions {
  routes: [any];
}