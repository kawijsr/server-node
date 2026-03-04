import 'reflect-metadata';

const paramMetadataKey = Symbol('Param');
const queryMetadataKey = Symbol('Query');
const bodyMetadataKey = Symbol('Body');
const requestMetadataKey = Symbol('Request');
const responseMetadataKey = Symbol('Response');


export function Routes(path: string) {
  return function (target: any) {
    const constructor = target.prototype.constructor;
    constructor.path = path;

    target.prototype.instance = (app) => {
      const keys = Object.getOwnPropertyNames(target.prototype);
      keys.forEach(key => {
        if (key !== 'instance' && key !== 'constructor') {
          const el = target.prototype[key];
          if (el instanceof IRoute) {
            const { method, path: routePath, handler } = el;
            const mapped = `/${(path || '').replace('/', '')}${(routePath || '').replace('/', '')}`;
            console.log(`Route -> ${method.toUpperCase()} ${mapped}`);
            app[method.toLowerCase()](mapped, handler);
          }
        }
      });
    };
  };
}

export function Route(method: string, path: string, options?: RouteOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const func = descriptor.value;
    const route = new IRoute();
    route.method = method;
    route.path = path;
    route.handler = (req, res) => {
      let params: { index: number, name: string }[] =
        Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
      let query: { index: number, name: string }[] =
        Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];
      let body: { index: number, name: string }[] =
        Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];
      let request: { index: number, name: string }[] =
          Reflect.getOwnMetadata(requestMetadataKey, target, propertyKey) || [];
      let response: { index: number, name: string }[] =
          Reflect.getOwnMetadata(responseMetadataKey, target, propertyKey) || [];

      const args = [...params, ...query, ...body, ...request, ...response].sort((a, b) => a.index - b.index)
        .map(param => req.params[param.name] || req.query[param.name] || (param.name === '@@body@@' ? req.body : undefined) || (param.name === '@@request@@' ? req : undefined) || (param.name === '@@response@@' ? res : undefined));

      if (options?.render) {
        return func.apply(target, args);
      }

      const result = func.apply(target, args);
      if (result instanceof Promise) {
        return result.then(data => res.send(data)).catch(err => res.status(err.statusCode || 500).send(err));
      }
      return res.send(result);
    };
    descriptor.value = route;
  };
}

export function Param(paramName: string) {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    let params: { index: number, name: string }[] =
      Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];

    params.push({
      index: parameterIndex,
      name: paramName
    });

    Reflect.defineMetadata(paramMetadataKey, params, target, propertyKey);
  };
}

export function Query(paramName: string) {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    let query: { index: number, name: string }[] =
      Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];

    query.push({
      index: parameterIndex,
      name: paramName
    });

    Reflect.defineMetadata(queryMetadataKey, query, target, propertyKey);
  };
}

export function Body() {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    let body: { index: number, name: string }[] =
      Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];

    body.push({
      index: parameterIndex,
      name: '@@body@@'
    });

    Reflect.defineMetadata(bodyMetadataKey, body, target, propertyKey);
  };
}

export function Req() {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    let request: { index: number, name: string }[] =
        Reflect.getOwnMetadata(requestMetadataKey, target, propertyKey) || [];

    request.push({
      index: parameterIndex,
      name: '@@request@@'
    });

    Reflect.defineMetadata(requestMetadataKey, request, target, propertyKey);
  };
}

export function Res() {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    let request: { index: number, name: string }[] =
        Reflect.getOwnMetadata(responseMetadataKey, target, propertyKey) || [];

    request.push({
      index: parameterIndex,
      name: '@@response@@'
    });

    Reflect.defineMetadata(responseMetadataKey, request, target, propertyKey);
  };
}

class IRoute {
  method: string;
  path: string;
  handler: (req: any, res: any) => any;
}

interface RouteOptions {
  render?: boolean;
}