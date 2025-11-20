/**
 * Calculate age band from date of birth
 */
export function calculateAgeBand(dob: string): string {
  try {
    // Parse DOB - assuming format DD/MM/YYYY or YYYY-MM-DD
    let birthDate: Date;
    
    if (dob.includes("/")) {
      // DD/MM/YYYY format
      const [day, month, year] = dob.split("/").map(Number);
      birthDate = new Date(year, month - 1, day);
    } else {
      birthDate = new Date(dob);
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Determine age band
    if (age < 18) return "0-18";
    if (age < 20) return "18-20";
    if (age < 30) return "20-30";
    if (age < 40) return "30-40";
    if (age < 50) return "40-50";
    if (age < 60) return "50-60";
    if (age < 70) return "60-70";
    return "70+";
  } catch (error) {
    return "Unknown";
  }
}

