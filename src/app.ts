import express from 'express';

import { initApiRoutes } from './components/index';

export class App {
  private readonly _app: express.Application = express();

  public constructor() {
    // Initialize middleware layers to apply to all layers (check app.stack)
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));

    // Initialize auth middleware to apply to all requests

    // Initialize API routes
    initApiRoutes(this._app);
  }

  public get app(): express.Application {
    return this._app;
  }
}
