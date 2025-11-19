import { IServer } from "./domain/interfaces/IServer";
import { errorHandler } from "./presentation/middlewares/middlewares";
import { CommonRouter } from "./presentation/routes/common.routes";

export class App {
  constructor(private _server: IServer) {}

  async initialize(): Promise<void> {
    this._registerRoutes();
    this._registerErrorHandler();
  }

  private _registerRoutes(): void {
    const commonRoutes = new CommonRouter().getRouter();

    this._server.registerRoutes("/api/common", commonRoutes);
  }

  private _registerErrorHandler(): void {
    this._server.registerErrorHandler(errorHandler);
  }

  async start(port: number): Promise<void> {
    await this._server.start(port);
  }

  async shutdown(): Promise<void> {
    console.log("Shut dow server");
  }
}
