import * as dotenv from 'dotenv';
dotenv.config({ path: './src/config/.env' });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// import { initRoles } from '.'

import { initApiRoutes } from './components/index';

export class App {
  private readonly _app: express.Application = express();

  public constructor() {
    // Initialize middleware layers to apply to all layers (check app.stack)
    this._app.use(cors());
    this._app.use(helmet());
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));

    // Initialize auth middleware to apply to all requests
    // initAuthMiddleware(this._app)

    // Initialize API routes
    initApiRoutes(this._app);
  }

  public get app(): express.Application {
    return this._app;
  }
}
