import { Application, RequestHandler, Request, Response, NextFunction } from 'express';
import http from 'http'
import { RouteDefinition } from './controller';
import dotenv from 'dotenv';
import MysqlSP, { spDefination } from './mysq_sp';
dotenv.config()
export default class Server {
  private app: Application;
  mysql_sp: MysqlSP;

  constructor(app: Application) {
    this.app = app;
    this.mysql_sp = new MysqlSP();
  };

  public async run(): Promise<http.Server> {
    return this.app.listen(process.env.PORT, () => {
      console.log(`The server is running on port ${process.env.PORT}`)
    });
  };

  public loadMiddleware(middlewares: Array<RequestHandler>): void {
    middlewares.forEach(middleware => {
      this.app.use(middleware);
    });
  };

  public loadEntity(controllers: any[]): void {
    for (let controller of controllers) {
      // This is our instantiated class
      const instance = new controller();
      const entities_controller: Array<spDefination> = Reflect.getMetadata('entity', controller);
      for (let e of entities_controller) {
       const result: { createProcedure: string, query: string } = <{ createProcedure: string, query: string }>instance[e.sp_method_name]();
        this.mysql_sp.drop_query(e.sp_method_name);
        const proc = `CREATE PROCEDURE ${e.sp_method_name}(
              ${result.createProcedure}
            )
            BEGIN
               ${result.query}
            END`;
        this.mysql_sp.connection_query(proc);
      }
    }
  }

  public loadControllers(controllers: Array<any>): void {
    controllers.forEach(controller => {
      // This is our instantiated class
      const instance = new controller();
      // The prefix saved to our controller
      const prefix = Reflect.getMetadata('prefix', controller);
      // Our `routes` array containing all our routes for this controller
      const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', controller);
      const mw: Array<(req: Request, res: Response, next: NextFunction) => void> = Reflect.getMetadata('mw', controller);
      console.log("🚀 ~ file: server.ts ~ line 34 ~ Server ~ loadControllers ~ mw", mw)

      this.app.use(prefix, mw);
      // Iterate over all routes and register them to our express application 
      routes.forEach(route => {
        //console.log("🚀 ~ file: index.ts ~ line 24 ~ route", route);
        // It would be a good idea at this point to substitute the `app[route.requestMethod]` with a `switch/case` statement
        // since we can't be sure about the availability of methods on our `app` object. But for the sake of simplicity
        // this should be enough for now.
        //   router.use(prefix + route.path, (req: express.Request, res: express.Response) => {
        //     // Execute our method for this path and pass our express request and response object.
        //     instance[route.methodName](req, res);
        //   })
        // route.mw.forEach(mw => {
        //   this.app.use(prefix + route.path, mw);
        // });
        if (route.mw)
          this.app[route.requestMethod](prefix + route.path, route.mw, (req: Request, res: Response) => {
            // Execute our method for this path and pass our express request and response object.
            return instance[route.methodName](req, res);
          });
        else
          if (route.mw)
            this.app[route.requestMethod](prefix + route.path, route.mw, (req: Request, res: Response) => {
              // Execute our method for this path and pass our express request and response object.
              return instance[route.methodName](req, res);
            });
      });
    });
  };
}