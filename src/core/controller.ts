import { Response, Request, NextFunction } from 'express';

/// decorators 

// Decorator/Controller.ts

export const API = (prefix: string = '',middleware?:((req: Request, res: Response, next: NextFunction) => void)[]): ClassDecorator => {
    return (target: any) => {
      Reflect.defineMetadata('prefix', prefix, target);
  
      // Since routes are set by our methods this should almost never be true (except the controller has no methods)
      if (! Reflect.hasMetadata('routes', target)) {
        Reflect.defineMetadata('routes', [], target);
      }
      if (! Reflect.hasMetadata('mw', target)) {
        Reflect.defineMetadata('mw', [], target);
      }

      if(middleware){
        Reflect.defineMetadata('mw', middleware, target);
      }

    };
  };

  // Model/RouteDefinition.ts

export interface RouteDefinition {
    // Path to our route
    path: string;
    // HTTP Request method (get, post, ...)
    requestMethod: 'get' | 'post' | 'delete' | 'options' | 'put';
    // Method name within our class responsible for this route
    methodName: string,
    mw?:((req: Request, res: Response, next: NextFunction) => void)[]
  }

  // Decorator/Get.ts

export const Get = (path: string,middleware?:((req: Request, res: Response, next: NextFunction) => void)[]): MethodDecorator => {
  // `target` equals our class, `propertyKey` equals our decorated method name
  return (target, propertyKey: string): void => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (! Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;

    routes.push({
      requestMethod: 'get',
      path,
      methodName: propertyKey,
      mw:middleware
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };

  
};

export const Put = (path: string,middleware?:((req: Request, res: Response, next: NextFunction) => void)[]): MethodDecorator => {
    // `target` equals our class, `propertyKey` equals our decorated method name
    return (target, propertyKey: string): void => {
      // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
      // To prevent any further validation simply set it to an empty array here.
      if (! Reflect.hasMetadata('routes', target.constructor)) {
        Reflect.defineMetadata('routes', [], target.constructor);
      }
  
      // Get the routes stored so far, extend it by the new route and re-set the metadata.
      const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;
  
      routes.push({
        requestMethod: 'put',
        path,
        methodName: propertyKey,
        mw:middleware
      });
      Reflect.defineMetadata('routes', routes, target.constructor);
    };
  
    
  };
  export const Post = (path: string,middleware?:((req: Request, res: Response, next: NextFunction) => void)[]): MethodDecorator => {
    // `target` equals our class, `propertyKey` equals our decorated method name
    return (target, propertyKey: string): void => {
      // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
      // To prevent any further validation simply set it to an empty array here.
      if (! Reflect.hasMetadata('routes', target.constructor)) {
        Reflect.defineMetadata('routes', [], target.constructor);
      }
  
      // Get the routes stored so far, extend it by the new route and re-set the metadata.
      const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;
  
      routes.push({
        requestMethod: 'post',
        path,
        methodName: propertyKey,
        mw:middleware
      });
      Reflect.defineMetadata('routes', routes, target.constructor);
    };
  
    
  };
  export const Delete = (path: string,middleware?:((req: Request, res: Response, next: NextFunction) => void)[]): MethodDecorator => {
    // `target` equals our class, `propertyKey` equals our decorated method name
    return (target, propertyKey: string): void => {
      // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
      // To prevent any further validation simply set it to an empty array here.
      if (! Reflect.hasMetadata('routes', target.constructor)) {
        Reflect.defineMetadata('routes', [], target.constructor);
      }
  
      // Get the routes stored so far, extend it by the new route and re-set the metadata.
      const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;
  
      routes.push({
        requestMethod: 'delete',
        path,
        methodName: propertyKey,
        mw:middleware
      });
      Reflect.defineMetadata('routes', routes, target.constructor);
    };
  
    
  };