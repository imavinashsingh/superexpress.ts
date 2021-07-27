import 'reflect-metadata';
import express, { Request, Response } from 'express';
import Test, { User } from './controller/test';
import Server from './core/server';
const app = express();
const server: Server = new Server(app);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello there!');
});

server.loadControllers([
  Test
]);

server.loadEntity([
  User
])

// golbal middleware
server.loadMiddleware([

])

const httpServer = server.run();