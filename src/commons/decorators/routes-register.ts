import 'reflect-metadata';
import {Validator} from '../utils/validator';

const paramMetadataKey = Symbol('Param');
const queryMetadataKey = Symbol('Query');
const bodyMetadataKey = Symbol('Body');
const requestMetadataKey = Symbol('Request');
const responseMetadataKey = Symbol('Response');

export function Routes(path: string = '', options?: RoutesOptions) {
  return function(target: any) {
    const constructor = target.prototype.constructor;
    constructor.path = path;

    target.prototype.instance = (app: any) => {
      const keys = Object.getOwnPropertyNames(target.prototype);

      keys.forEach(key => {
        if (key !== 'instance' && key !== 'constructor') {
          const routeInfo = Reflect.getOwnMetadata(`route:${key}`,
              target.prototype);

          if (routeInfo) {
            const {method, path: routePath, handler, middleware} = routeInfo;

            const mapped = `${(path?.startsWith('/') ? path : '/' + path) ||
            '/'}${(routePath?.startsWith('/') ? routePath : '/' + routePath) ||
            '/'}`.replace(/\/+/g, '/');
            console.log(`Route -> ${method.toUpperCase()} ${mapped}`);

            const routeHandler = (req: any, res: any, next: any) => {
              if (!target.prototype._classInstance) {
                target.prototype._classInstance = new target();
              }
              handler.call(target.prototype._classInstance, req, res, next);
            };

            const totalMiddleware = [
              ...(options?.middleware || []),
              ...middleware];
            app[method](mapped, totalMiddleware, routeHandler);
          }
        }
      });
    };
  };
}

export function Route(method: string, path: string, options?: RouteOptions) {
  return function(
      target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(req: any, res: any, next: any) {
      let params = Reflect.getOwnMetadata(paramMetadataKey, target,
          propertyKey) || [];
      let query = Reflect.getOwnMetadata(queryMetadataKey, target,
          propertyKey) || [];
      let body = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) ||
          [];
      let request = Reflect.getOwnMetadata(requestMetadataKey, target,
          propertyKey) || [];
      let response = Reflect.getOwnMetadata(responseMetadataKey, target,
          propertyKey) || [];

      try {
        await Promise.all(body.map(async (param) => {
          if (param.type !== Object) {
            req.body = await Validator.validate(param.type, req.body);
          }
        }));

        const args = [
          ...params,
          ...query,
          ...body,
          ...request,
          ...response].sort((a, b) => a.index - b.index).
            map(param => req.params[param.name] || req.query[param.name] ||
                (param.name === '@@body@@' ? req.body : undefined) ||
                (param.name === '@@request@@' ? req : undefined) ||
                (param.name === '@@response@@' ? res : undefined));

        const result = await originalMethod.apply(this, args);

        if (options?.render) {
          return result;
        }

        return res.send(result);
      } catch (err) {
        next(err); // Buen manejo de errores en Express
      }
    };

    const routeInfo = {
      method: method.toLowerCase(),
      path,
      middleware: options?.middleware || [],
      handler: descriptor.value, // El handler ahora es la función envuelta
    };

    Reflect.defineMetadata(`route:${propertyKey}`, routeInfo, target);
  };
}

export function Param(paramName: string) {
  return function(target: Object, propertyKey: string, parameterIndex: number) {
    let params: { index: number, name: string }[] =
        Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];

    params.push({
      index: parameterIndex,
      name: paramName,
    });

    Reflect.defineMetadata(paramMetadataKey, params, target, propertyKey);
  };
}

export function Query(paramName: string) {
  return function(target: Object, propertyKey: string, parameterIndex: number) {
    let query: { index: number, name: string }[] =
        Reflect.getOwnMetadata(queryMetadataKey, target, propertyKey) || [];

    query.push({
      index: parameterIndex,
      name: paramName,
    });

    Reflect.defineMetadata(queryMetadataKey, query, target, propertyKey);
  };
}

export function Body() {
  return function(target: Object, propertyKey: string, parameterIndex: number) {
    let body: { index: number, name: string, type: any }[] =
        Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];

    const paramTypes = Reflect.getMetadata('design:paramtypes', target,
        propertyKey);
    const paramType = paramTypes[parameterIndex];

    body.push({
      index: parameterIndex,
      name: '@@body@@',
      type: paramType,
    });

    Reflect.defineMetadata(bodyMetadataKey, body, target, propertyKey);
  };
}

export function Req() {
  return function(target: Object, propertyKey: string, parameterIndex: number) {
    let request: { index: number, name: string }[] =
        Reflect.getOwnMetadata(requestMetadataKey, target, propertyKey) || [];

    request.push({
      index: parameterIndex,
      name: '@@request@@',
    });

    Reflect.defineMetadata(requestMetadataKey, request, target, propertyKey);
  };
}

export function Res() {
  return function(target: Object, propertyKey: string, parameterIndex: number) {
    let request: { index: number, name: string }[] =
        Reflect.getOwnMetadata(responseMetadataKey, target, propertyKey) || [];

    request.push({
      index: parameterIndex,
      name: '@@response@@',
    });

    Reflect.defineMetadata(responseMetadataKey, request, target, propertyKey);
  };
}

class IRoute {
  method: string;
  path: string;
  handler: (req: any, res: any) => any;
  middleware?: RouteMiddleware[];
}

type RouteMiddleware = (req, res, next) => void;

interface RoutesOptions {
  middleware?: RouteMiddleware[];
}

interface RouteOptions {
  render?: boolean;
  middleware?: RouteMiddleware[];
}