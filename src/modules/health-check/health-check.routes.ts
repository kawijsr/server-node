import {
  Body,
  Param,
  Query,
  Route,
  Routes,
  Req,
  Res,
} from '../../commons/decorators/routes-register';
import { Request, Response } from 'express';
import {healthCheckService} from './health-check.service';

@Routes('/')
export class HealthCheckRoutes {

  @Route('get', '/')
  public healthCheck() {
    return healthCheckService.healthCheck();
  }

  @Route('get', '/ping')
  public ping() {
    return healthCheckService.ping();
  }

  @Route('get', '/dynamic/:id/ping/:name')
  public pingDynamic(
      @Param('id') id: string, @Param('name') name: string,
      @Query('t') t: string) {
    return healthCheckService.pingDynamic({id, name, t});
  }

  @Route('post', '/dynamic/:id/ping/:name')
  public pingDynamicPost(
      @Param('id') id: string,
      @Param('name') name: string,
      @Query('t') t: string,
      @Body() body: any,
      @Req() request: Request,
      @Res() response: Response,
  ) {
    return healthCheckService.pingDynamicPost({id, name, t, body});
  }
}