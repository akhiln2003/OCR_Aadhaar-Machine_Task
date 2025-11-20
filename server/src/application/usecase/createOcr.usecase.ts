import { ICreateOcrUsecase } from "../interface/ICreateOcrUsecase";
import {
  IOcrService,
  ExtractedOcrData,
} from "../../infrastructure/@types/IOcrService";
import { calculateAgeBand } from "../../infrastructure/utils/ageBand";
import { ApiError } from "../../presentation/errors/ApiError";

export class CreateOcrUsecase implements ICreateOcrUsecase {
  constructor(private _ocrService: IOcrService) {}

  async execute(
    frontImage: Express.Multer.File,
    backImage: Express.Multer.File
  ): Promise<ExtractedOcrData> {
    try {
      // Extract OCR data from images
      const extractedData: ExtractedOcrData =
        await this._ocrService.extractFromImages(frontImage, backImage);

      // Calculate age band from DOB
      const age_band = calculateAgeBand(extractedData.DOB);

      // Return extracted data with age band
      return {
        ...extractedData,
        age_band,
      };
    } catch (error: any) {
      throw new ApiError({
        message: error.message || "Failed to process OCR",
        statusCode: 500,
        code: "OCR_PROCESSING_ERROR",
      });
    }
  }
}
