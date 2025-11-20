import { Ocr } from "../entities/Ocr";

export interface IOcrRepository {
  create(data: Ocr): Promise<Ocr>;
}
