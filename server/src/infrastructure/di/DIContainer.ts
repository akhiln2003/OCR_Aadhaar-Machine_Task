import { ICreateOcrUsecase } from "../../application/interface/ICreateOcrUsecase";
import { CreateOcrUsecase } from "../../application/usecase/createOcr.usecase";
import { IOcrService } from "../@types/IOcrService";
import { OcrService } from "../services/OcrService";

export class DIContainer {
  private _ocrService: IOcrService;

  constructor() {
    this._ocrService = new OcrService();
  }

  createOcrUsecase(): ICreateOcrUsecase {
    return new CreateOcrUsecase(this._ocrService);
  }
}
