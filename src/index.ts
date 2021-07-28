import 'reflect-metadata';
import express, { json, Request, Response, urlencoded } from 'express';
import Server from './core/server';
import Admin from './controller/admin';
import path from 'path';
import cors from 'cors';
import AdminModel from './model/admin';
const app = express();
const server: Server = new Server(app);

const controllers = [
  Admin
];

const middlewares = [
  express.static(path.join(__dirname, 'public')),
  urlencoded({ extended: false }),
  json(),
  cors({ credentials: true, origin: true })
];

const entities = [
  AdminModel
];



app.get('/', (req: Request, res: Response) => {
  res.send('Hello there!');
});

Promise.resolve(_ => {
  server.loadEntity(entities)
}).then(_ => {
  // golbal middleware
  server.loadMiddleware(middlewares);
  server.loadControllers(controllers);
}).then(_ => {
  server.run();
})