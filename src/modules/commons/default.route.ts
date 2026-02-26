import {Route, Routes} from '../../commons/decorators/routes-register';

@Routes('/')
export class DefaultRoute {
  @Route('get', '/*splat')
  public default() {
    return 'Hello World';
  }
}