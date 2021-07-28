import { API, Get } from '../core/controller';
import { NextFunction, Request, Response } from 'express';
import { entity, sp, spResponse } from '../core/mysq_sp';

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