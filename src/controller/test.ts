import { API, Get } from '../core/controller';
import { NextFunction, Request, Response } from 'express';
import { entity, sp } from '../core/mysq_sp';

@API('',[testMiddleware])
export default class Test {
  @Get('/login', [
    test1Middleware,
    testMiddleware
  ])
  public index(req: Request, res: Response) {
    return res.send('User overview');
  }

  @Get('/:name', [
    testMiddleware
  ])
  public details(req: Request, res: Response) {
    return res.send(`You are looking at the profile of ${req.params.name}`);
  }
}


export function testMiddleware(req: any, res: any, next: any) {
  console.log("avinash");
  next()

}


export function test1Middleware(req: any, res: any, next: any) {
  console.log("avi");
  next()

}

class Modal {
  /**
   * 
   * @param createProcedure 
   *  IN var_name VARCHAR(20),
        IN var_id CHAR(255)
   * @param query 
        SELECT * from Agent where AGENT_NAME = var_name and COMMISSION in (var_id)
   */
  createProcedure(createProcedure:string,query:string){
    return `
    CREATE PROCEDURE SP_GETMESSAGE(
     
      )
    `;
  }
}

@entity()
export class User{
  @sp()
  getUser(){
    return {
      createProcedure:`IN var_name VARCHAR(20),
      IN var_id CHAR(255)`,
      query:`
      SELECT * from Agent where AGENT_NAME = var_name and COMMISSION in (var_id);
      `
    }
  }


}

const a=new User().getUser();

console.log("🚀 ~ file: test.ts ~ line 48 ~ a", a)