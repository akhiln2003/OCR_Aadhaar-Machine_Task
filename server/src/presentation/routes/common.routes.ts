import { Router } from "express";
import { DIContainer } from "../../infrastructure/di/DIContainer";
import multer from "multer";

export class CommonRouter {
  private _router: Router;
  private _diContainer: DIContainer;
  private _upload = multer({ storage: multer.memoryStorage() });

  constructor() {
    this._router = Router();
    this._diContainer = new DIContainer();
    this._initializeControllers();
    this._initializeRoutes();
  }

  private _initializeControllers(): void {}

  private _initializeRoutes(): void {}

  public getRouter(): Router {
    return this._router;
  }
}
