import type { AadharData } from "../../App";

interface ParsedDataSectionProps {
  data: AadharData | null;
  loading: boolean;
}

function ParsedDataSection({ data, loading }: ParsedDataSectionProps) {
  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-12 text-center">
        <div className="animate-pulse text-gray-500 text-sm">Processing...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-100 rounded-lg p-12 text-center">
        <p className="text-gray-500 text-sm">
          Start Performing OCR by inputting your Aadhaar front and back
        </p>
      </div>
    );
  }

  const rows = [
    { label: "Name", value: data.Name },
    { label: "Aadhaar Number (UID)", value: data.UID },
    { label: "Date of Birth", value: data.DOB },
    { label: "Gender", value: data.Gender },
    { label: "Age Band", value: data.age_band },
    { label: "Address", value: data.address },
    { label: "Pincode", value: data.pincode },
    { label: "Mobile Number", value: data.mobileNumber || data.maskedMobileNumber },
  ].filter((row) => Boolean(row.value));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800 mb-5">Parsed Data</h2>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="border-t border-gray-200 pt-4 first:border-0 first:pt-0">
            <div className="text-xs text-gray-500 mb-1">{row.label}</div>
            <div className="text-sm text-gray-900 font-medium whitespace-pre-line">
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParsedDataSection;