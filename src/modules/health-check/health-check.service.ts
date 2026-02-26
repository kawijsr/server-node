import {
  Command,
  Type,
} from '../../commons/decorators/validator/validator.decorator';
import {
  PingDynamicCommand,
  PingDynamicCommandPost,
} from './health-check.commands';

class HealthCheckService {
  private static instance: HealthCheckService;

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  healthCheck() {
    return {
      status: 'OK',
    }
  }

  ping() {
    return {
      status: 'Pong',
    };
  }

  @Command()
  pingDynamic(@Type(PingDynamicCommand) cmd: PingDynamicCommand) {
    return cmd;
  }

  @Command()
  pingDynamicPost(@Type(PingDynamicCommandPost) cmd: PingDynamicCommandPost) {
    return cmd;
  }
}

export const healthCheckService = HealthCheckService.getInstance();
