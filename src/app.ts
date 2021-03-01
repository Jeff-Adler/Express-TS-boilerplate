import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, `../config/${process.env.ENVIRONMENT}.env`) });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { initApiRoutes } from './components/index';

export class App {
  private readonly _app: express.Application = express();

  public constructor() {
    // Initialize middleware layers to apply to all layers (check app.stack)
    this._app.use(cors());
    this._app.use(helmet());
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));

    // Initialize API routes
    initApiRoutes(this._app);
  }

  public get app(): express.Application {
    return this._app;
  }
}
