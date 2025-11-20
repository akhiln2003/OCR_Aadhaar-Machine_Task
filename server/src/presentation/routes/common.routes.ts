import { Router } from "express";
import { DIContainer } from "../../infrastructure/di/DIContainer";
import multer from "multer";
import { OcrController } from "../controllers/ocr.controller";

export class CommonRouter {
  private _router: Router;
  private _diContainer: DIContainer;
  private _ocrController!: OcrController;

  constructor(private _upload = multer({ storage: multer.memoryStorage() })) {
    this._router = Router();
    this._diContainer = new DIContainer();
    this._initializeControllers();
    this._initializeRoutes();
  }

  private _initializeControllers(): void {
    this._ocrController = new OcrController(
      this._diContainer.createOcrUsecase()
    );
  }

  private _initializeRoutes(): void {
    this._router.post(
      "/ocr/parse",
      this._upload.fields([
        { name: "front_image", maxCount: 1 },
        { name: "back_image", maxCount: 1 },
      ]),
      (req, res, next) => this._ocrController.parseAadhaar(req, res, next)
    );
  }

  public getRouter(): Router {
    return this._router;
  }
}
