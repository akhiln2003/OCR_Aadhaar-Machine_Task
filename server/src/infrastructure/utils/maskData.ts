
export function maskName(name: string): string {
  if (!name || name.length === 0) return "";
  return "*".repeat(Math.max(name.length, 15));
}

/**
 * Masks UID (Aadhaar number) completely (fully redacted with asterisks)
 */
export function maskUID(uid: string): string {
  if (!uid || uid.length === 0) return "";
  return "*".repeat(Math.max(uid.length, 12));
}


/**
 * Masks address by showing only the last part (after comma or last few characters)
 * Based on the image, it shows partial address at the end
 */
export function maskAddress(address: string): string {
  if (!address || address.length === 0) return "";
  // Show only last 25-30 characters, mask the rest
  if (address.length <= 25) {
    return "*".repeat(Math.max(address.length, 20)) + address;
  }
  // Mask most of it, show last part
  const visiblePart = address.slice(-25);
  const maskedLength = address.length - 25;
  return "*".repeat(Math.max(maskedLength, 20)) + visiblePart;
}

/**
 * Masks all sensitive fields in OCR data for API response
 */
export interface MaskedOcrData {
  Name: string;
  DOB: string;
  Gender: string;
  UID: string;
  address: string;
  pincode: string;
  age_band: string;
  IsUidSame: string;
}

export function maskOcrData(data: {
  Name: string;
  DOB: string;
  Gender: string;
  UID: string;
  address: string;
  pincode: string;
  age_band: string;
  IsUidSame: string;
}): MaskedOcrData {
  return {
    Name: maskName(data.Name),
    DOB: data.DOB,
    Gender: data.Gender,
    UID: maskUID(data.UID),
    address: maskAddress(data.address),
    pincode: data.pincode,
    age_band: data.age_band,
    IsUidSame: data.IsUidSame,
  };
}

