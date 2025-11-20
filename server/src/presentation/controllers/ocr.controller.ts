import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
import { ICreateOcrUsecase } from "../../application/interface/ICreateOcrUsecase";

export class OcrController {
  constructor(private _createOcrUsecase: ICreateOcrUsecase) {}

  async parseAadhaar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined;
      const frontImage = files?.["front_image"]?.[0];
      const backImage = files?.["back_image"]?.[0];
      if (!frontImage) {
        throw new ApiError({
          message: "Front image is required",
          statusCode: 400,
          code: "MISSING_FRONT_IMAGE",
        });
      }

      if (!backImage) {
        throw new ApiError({
          message: "Back image is required",
          statusCode: 400,
          code: "MISSING_BACK_IMAGE",
        });
      }

      // Process OCR 
      const extractedData = await this._createOcrUsecase.execute(
        frontImage,
        backImage
      );

      // Return unmasked data directly for display
      const responseData = {
        Name: extractedData.Name,
        DOB: extractedData.DOB,
        Gender: extractedData.Gender,
        UID: extractedData.UID,
        address: extractedData.address,
        pincode: extractedData.pincode,
        age_band: extractedData.age_band,
        IsUidSame: extractedData.IsUidSame,
      };

      // Return response in the format shown in the image
      res.status(200).json({
        status: true,
        data: [responseData],
        message: "Parsing Successfull",
      });
    } catch (error) {
      next(error);
    }
  }
}
