/**
 * Interface for OCR service
 * Implement this with your preferred OCR library (Tesseract.js, Google Vision API, etc.)
 */
export interface ExtractedOcrData {
  Name: string;
  DOB: string;
  Gender: string;
  UID: string;
  address: string;
  pincode: string;
  age_band: string;
  IsUidSame: string;
  rawText?: string;
}

export interface IOcrService {
  extractFromImages(
    frontImage: Express.Multer.File,
    backImage: Express.Multer.File
  ): Promise<ExtractedOcrData>;
}

