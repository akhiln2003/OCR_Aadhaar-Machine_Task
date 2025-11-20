import { ExtractedOcrData } from "../../infrastructure/@types/IOcrService";

export interface ICreateOcrUsecase {
  execute(frontImage: Express.Multer.File, backImage: Express.Multer.File): Promise<ExtractedOcrData>;
}
