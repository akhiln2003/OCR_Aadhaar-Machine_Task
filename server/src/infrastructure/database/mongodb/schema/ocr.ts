import mongoose from "mongoose";

interface OcrAttributes {
  frontImage: string; // URL or path
  backImage: string; // optional
  name: string;
  aadhaarNumber: string;
  dob: string;
  rawText: string;
}

interface OcrDoc extends mongoose.Document {
  frontImage: string;
  backImage: string;
  name: string;
  aadhaarNumber: string;
  dob: string;
  rawText: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OcrModel extends mongoose.Model<OcrDoc> {
  build(attributes: OcrAttributes): OcrDoc;
}

const ocrSchema = new mongoose.Schema({
  frontImage: {
    type: String,
    required: true,
  },
  backImage: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  aadhaarNumber: {
    type: String,
    required: false,
  },
  dob: {
    type: String,
    required: false,
  },
  rawText: {
    type: String,
    required: true,
  },
});

// Static Build Method
ocrSchema.statics.build = (attrs: OcrAttributes) => {
  return new Ocr(attrs);
};

const Ocr = mongoose.model<OcrDoc, OcrModel>("Ocr", ocrSchema);

export { Ocr };
