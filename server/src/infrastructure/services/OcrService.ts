import { IOcrService, ExtractedOcrData } from "../@types/IOcrService";
import { ApiError } from "../../presentation/errors/ApiError";
import { createWorker, PSM } from "tesseract.js";

export class OcrService implements IOcrService {
  private readonly AADHAAR_KEYWORDS = [
    "aadhaar",
    "aadhar",
    "government of india",
    "goi",
    "uidai",
    "enrolment",
    "male",
    "female",
    "transgender",
  ];

  /**
   * Validates if the extracted text contains Aadhaar card keywords
   */
  private validateAadhaarImage(extractedText: string): boolean {
    const lowerText = extractedText.toLowerCase();
    const keywordCount = this.AADHAAR_KEYWORDS.filter((keyword) =>
      lowerText.includes(keyword)
    ).length;

    return keywordCount >= 2;
  }

  /**
   * Extracts text from image using Tesseract.js
   */
  private async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    const worker = await createWorker("eng");
    try {
      // Configure worker for better recognition - use auto page segmentation
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO, // for Aadhaar card text
        tessedit_ocr_engine_mode: 3,
      });

      const {
        data: { text },
      } = await worker.recognize(imageBuffer);
      await worker.terminate();

      return text;
    } catch (error) {
      await worker.terminate();
      throw error;
    }
  }

  /**
   * Extracts UID from text (12-digit number) - usually at bottom of front side
   */
  private extractUID(text: string): string | null {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Pattern 1: Look for UID in lines (usually appears at bottom of front side)
    // Format: XXXX XXXX XXXX or just digits
    for (const line of lines) {
      // Look for 4-4-4 pattern with spaces or dashes
      const pattern1 = /(\d{4}[\s\-]?\d{4}[\s\-]?\d{4})/;
      const match1 = line.match(pattern1);
      if (match1 && match1[1]) {
        const uid = match1[1].replace(/[^\d]/g, "");
        if (uid.length === 12) {
          // Validate: not all same digits
          if (!uid.split("").every((char) => char === uid[0])) {
            return uid;
          }
        }
      }

      // Look for exactly 12 consecutive digits
      const pattern2 = /\b(\d{12})\b/;
      const match2 = line.match(pattern2);
      if (match2 && match2[1]) {
        const uid = match2[1];
        // Skip invalid patterns
        if (
          uid !== "000000000000" &&
          uid !== "111111111111" &&
          uid !== "123456789012"
        ) {
          if (!uid.split("").every((char) => char === uid[0])) {
            return uid;
          }
        }
      }
    }

    // Pattern 2: Extract from entire text with prefix
    const prefixPattern =
      /(?:aadhaar|aadhar|uid|enrollment|enrolment|number)[\s:]*(\d{4}[\s\-]?\d{4}[\s\-]?\d{4})/gi;
    let matchWithPrefix = prefixPattern.exec(text);
    if (matchWithPrefix && matchWithPrefix[1]) {
      const uid = matchWithPrefix[1].replace(/[^\d]/g, "");
      if (
        uid.length === 12 &&
        !uid.split("").every((char) => char === uid[0])
      ) {
        return uid;
      }
    }

    // Pattern 3: Look in last few lines (UID usually at bottom)
    for (let i = Math.max(0, lines.length - 5); i < lines.length; i++) {
      const line = lines[i];
      // Extract all digits from line
      const digits = line.replace(/[^\d]/g, "");
      // Look for 12-digit sequence
      for (let j = 0; j <= digits.length - 12; j++) {
        const candidate = digits.substring(j, j + 12);
        if (
          candidate !== "000000000000" &&
          candidate !== "111111111111" &&
          candidate !== "123456789012" &&
          !candidate.split("").every((char) => char === candidate[0])
        ) {
          return candidate;
        }
      }
    }

    return null;
  }

  /**
   * Extracts name from text - Aadhaar cards have name on front side, usually after "Name" label
   */
  private extractName(text: string): string {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Pattern 1: Look for "Name" label followed by name on same or next line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Check if line contains "name" keyword (but not "aadhaar", "surname", etc.)
      if (
        (lowerLine.includes("name") || lowerLine.includes("नाम")) &&
        !lowerLine.includes("aadhaar") &&
        !lowerLine.includes("father") &&
        !lowerLine.includes("mother") &&
        !lowerLine.includes("husband")
      ) {
        // Try multiple patterns on same line
        const patterns = [
          /name\s*:?\s*([A-Z][A-Za-z\s]{2,})/i,
          /name\s*:?\s*([A-Z\s]{3,})/,
          /नाम\s*:?\s*([A-Z][A-Za-z\s]{2,})/i,
          /:?\s*([A-Z][A-Za-z\s]{4,})/,
        ];

        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            let name = match[1].trim();
            // Clean up name - remove numbers, special chars except spaces
            name = name.replace(/[^A-Za-z\s]/g, "").trim();
            // Should have reasonable length and mostly letters
            if (name.length >= 3 && /[A-Za-z]/.test(name)) {
              return name;
            }
          }
        }

        // Check next 1-2 lines if current line is just "Name" label
        for (let j = 1; j <= 2 && i + j < lines.length; j++) {
          const nextLine = lines[i + j];
          // Skip if next line looks like DOB, UID, or other data
          if (
            /^\d/.test(nextLine) ||
            nextLine.toLowerCase().includes("dob") ||
            nextLine.toLowerCase().includes("date") ||
            nextLine.toLowerCase().includes("year")
          ) {
            continue;
          }

          // Next line should be mostly letters (uppercase is typical on Aadhaar)
          const cleaned = nextLine.replace(/[^A-Za-z\s]/g, "").trim();
          if (cleaned.length >= 3 && /^[A-Za-z\s]{3,}$/.test(cleaned)) {
            // Should not be all same character
            if (
              !cleaned
                .split("")
                .every((char) => char === cleaned[0] || char === " ")
            ) {
              return cleaned;
            }
          }
        }
      }
    }

    // Pattern 2: Look for lines that look like names (usually in top half)
    // Names on Aadhaar are typically all uppercase with 2-4 words
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const line = lines[i];

      // Skip lines that are clearly not names
      const lowerLine = line.toLowerCase();
      if (
        lowerLine.includes("government") ||
        lowerLine.includes("aadhaar") ||
        lowerLine.includes("uidai") ||
        lowerLine.includes("dob") ||
        /^\d{12}$/.test(line) ||
        /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(line) ||
        lowerLine.includes("male") ||
        lowerLine.includes("female")
      ) {
        continue;
      }

      // Try to extract name from line
      const cleaned = line.replace(/[^A-Za-z\s]/g, "").trim();

      // Should be 2-6 words, mostly letters, reasonable length
      const words = cleaned.split(/\s+/).filter((w) => w.length > 0);
      if (
        words.length >= 2 &&
        words.length <= 6 &&
        cleaned.length >= 5 &&
        cleaned.length <= 50
      ) {
        // Check if it looks like a name (starts with capital, has letters)
        if (/^[A-Z]/.test(cleaned) && /[A-Za-z]/.test(cleaned)) {
          // Should not be all same character
          const uniqueChars = new Set(cleaned.replace(/\s/g, "").toLowerCase());
          if (uniqueChars.size > 1) {
            return cleaned;
          }
        }
      }
    }

    // Pattern 3: Look for capitalized words pattern (First Last or First Middle Last)
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      // Pattern: Capital letter followed by lowercase letters, space, another capital...
      const namePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/;
      const match = line.match(namePattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.split(/\s+/).length >= 2 && name.length >= 5) {
          return name;
        }
      }
    }

    return "";
  }

  /**
   * Extracts Date of Birth from text - usually DD/MM/YYYY format on Aadhaar
   */
  private extractDOB(text: string): string {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Pattern 1: Look for "DOB" or "Date of Birth" label
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      if (
        lowerLine.includes("dob") ||
        lowerLine.includes("date of birth") ||
        lowerLine.includes("birth")
      ) {
        // Extract date from same line
        const dateMatch = line.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/);
        if (dateMatch && dateMatch[1]) {
          return dateMatch[1].trim();
        }

        // Check next line
        if (i + 1 < lines.length) {
          const dateMatch2 = lines[i + 1].match(
            /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/
          );
          if (dateMatch2 && dateMatch2[1]) {
            return dateMatch2[1].trim();
          }
        }
      }
    }

    // Pattern 2: Find all date patterns and validate them
    // Aadhaar DOB is usually DD/MM/YYYY format
    const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g;
    const dates = text.match(datePattern);

    if (dates && dates.length > 0) {
      // Return the first valid date (usually DOB is the first date on front side)
      for (const date of dates) {
        const parts = date.split(/[\/\-\.]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          // Validate: day 1-31, month 1-12, year reasonable (1900-2100)
          if (
            day >= 1 &&
            day <= 31 &&
            month >= 1 &&
            month <= 12 &&
            year >= 1900 &&
            year <= 2100
          ) {
            // Format as DD/MM/YYYY and return original format
            return date;
          }
        }
      }
    }

    return "";
  }

  /**
   * Extracts Gender from text - usually appears after DOB on front side
   */
  private extractGender(text: string): string {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const lowerText = text.toLowerCase();

    // Look for gender keyword in lines
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes("male") && !lowerLine.includes("female")) {
        return "MALE";
      } else if (lowerLine.includes("female")) {
        return "FEMALE";
      } else if (lowerLine.includes("transgender")) {
        return "TRANSGENDER";
      }
    }

    // Also check combined text
    if (lowerText.includes("male") && !lowerText.includes("female")) {
      return "MALE";
    } else if (lowerText.includes("female")) {
      return "FEMALE";
    } else if (lowerText.includes("transgender")) {
      return "TRANSGENDER";
    }

    return "";
  }

  /**
   * Extracts pincode from text (6-digit number) - usually at end of address
   */
  private extractPincode(text: string): string {
    const pincodePattern = /\b\d{6}\b/g;
    const matches = text.match(pincodePattern);

    if (matches && matches.length > 0) {
      for (let i = matches.length - 1; i >= 0; i--) {
        const candidate = matches[i];
        if (candidate[0] !== "0") {
          return candidate;
        }
      }
      return matches[matches.length - 1];
    }

    return "";
  }

  /**
   * Extracts mobile number from text (10-digit number)
   */
  private extractMobileNumber(text: string): string {
    const mobilePattern = /\b[6-9]\d{9}\b/;
    const matches = text.match(mobilePattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
    return "";
  }

  /**
   * Extracts address from text - usually on back side
   */
  private extractAddress(text: string): string {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Pattern 1: Look for "Address" label
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes("address") || lowerLine.includes("पता")) {
        // Get address from same line or next lines
        const addressParts: string[] = [];

        // Check current line after "Address"
        const match = line.match(/(?:address|पता)\s*:?\s*(.+)/i);
        if (match && match[1]) {
          let addressPart = match[1].trim();
          // Remove leading colons, spaces, and special characters
          addressPart = addressPart.replace(/^[:\s\-]+/, "").trim();
          if (addressPart.length > 0) {
            addressParts.push(addressPart);
          }
        }

        // Collect next few lines that look like address
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const nextLine = lines[j];
          // Skip if it looks like pincode (6 digits) or UID
          if (
            !/^\d{6}$/.test(nextLine) &&
            !/^\d{12}$/.test(nextLine) &&
            nextLine.length > 3
          ) {
            // Clean the line - remove leading colons, special chars
            let cleanLine = nextLine.replace(/^[:\s\-]+/, "").trim();
            if (cleanLine.length > 0) {
              addressParts.push(cleanLine);
            }
          } else {
            break;
          }
        }

        if (addressParts.length > 0) {
          const address = addressParts.join(", ").trim();
          // Remove any leading colons or special characters from final address
          return address.replace(/^[:\s\-]+/, "").trim();
        }
      }
    }

    // Pattern 2: Find lines that look like address (mix of text and numbers, multiple lines)
    const addressLines: string[] = [];
    for (const line of lines) {
      // Skip UID, pincode, dates, pure numbers
      if (
        /^\d{12}$/.test(line) ||
        /^\d{6}$/.test(line) ||
        /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(line)
      ) {
        continue;
      }
      // Should have letters and possibly numbers, spaces
      if (/[A-Za-z]/.test(line) && line.length > 5) {
        // Clean the line - remove leading colons, special chars
        let cleanLine = line.replace(/^[:\s\-]+/, "").trim();
        if (cleanLine.length > 0) {
          addressLines.push(cleanLine);
          if (addressLines.length >= 3) break;
        }
      }
    }

    if (addressLines.length > 0) {
      const address = addressLines.join(", ").trim();
      return address.replace(/^[:\s\-]+/, "").trim();
    }

    return "";
  }

  async extractFromImages(
    frontImage: Express.Multer.File,
    backImage: Express.Multer.File
  ): Promise<ExtractedOcrData> {
    try {
      // Extract text from both images
      const [frontText, backText] = await Promise.all([
        this.extractTextFromImage(frontImage.buffer),
        this.extractTextFromImage(backImage.buffer),
      ]);

      const combinedText = frontText + "\n" + backText;

      // Validate if images are Aadhaar cards
      const isFrontAadhaar = this.validateAadhaarImage(frontText);
      const isBackAadhaar = this.validateAadhaarImage(backText);

      if (!isFrontAadhaar && !isBackAadhaar) {
        throw new ApiError({
          message:
            "Invalid Aadhaar card image. Please upload a valid Aadhaar card image.",
          statusCode: 400,
          code: "INVALID_AADHAAR_IMAGE",
        });
      }

      // Extract data from front image (name, DOB, gender, UID)
      const frontUID = this.extractUID(frontText);
      const name =
        this.extractName(frontText) || this.extractName(combinedText);
      const dob = this.extractDOB(frontText) || this.extractDOB(combinedText);
      const gender =
        this.extractGender(frontText) || this.extractGender(combinedText);

      // Extract data from back image (address, pincode, mobile number)
      const address =
        this.extractAddress(backText) || this.extractAddress(combinedText);
      const pincode =
        this.extractPincode(backText) || this.extractPincode(combinedText);
      const mobileNumber =
        this.extractMobileNumber(backText) ||
        this.extractMobileNumber(combinedText);

      // Extract UID from back image and compare with front
      const backUID = this.extractUID(backText);
      let isUidSame = "Back UID Not Found";

      if (frontUID && backUID) {
        isUidSame = frontUID === backUID ? "UID Matched" : "UID Mismatch";
      }

      const uid = frontUID || backUID || "";

      if (!uid) {
        const debugText = combinedText.substring(0, 500);
        console.error("UID Extraction Failed. Raw text preview:", debugText);
        throw new ApiError({
          message:
            "Could not extract UID from Aadhaar card. Please ensure the images are clear and valid. The UID should be a 12-digit number visible on the card.",
          statusCode: 400,
          code: "UID_NOT_FOUND",
        });
      }

      return {
        Name: name,
        DOB: dob,
        Gender: gender,
        UID: uid,
        address: address,
        pincode: pincode,
        mobileNumber: mobileNumber,
        age_band: "", 
        IsUidSame: isUidSame,
        rawText: combinedText,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: `OCR extraction failed: ${error.message}`,
        statusCode: 500,
        code: "OCR_EXTRACTION_ERROR",
      });
    }
  }
}
