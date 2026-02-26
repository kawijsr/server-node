import { config } from 'dotenv';

config();

export class Configurations {
  static get(envVar: string) {
    return process.env[envVar];
  }
}