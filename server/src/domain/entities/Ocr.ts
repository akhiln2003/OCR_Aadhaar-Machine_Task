export class Ocr {
  constructor(
    public frontImageBase64: string,
    public backImageBase64: string,
    public Name: string,
    public DOB: string,
    public Gender: string,
    public UID: string,
    public address: string,
    public pincode: string,
    public age_band: string,
    public mobileNumber: string,
    public IsUidSame: string,
    public rawText?: string,
    public id?: string,
    public createdAt?: Date
  ) {}
}
  