import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Toast from "./components/ui/Toast";
import UploadCard from "./components/ui/UploadCard";
import ParsedDataSection from "./components/ui/ParsedDataSection";

export interface AadharData {
  Name: string;
  DOB: string;
  Gender: string;
  UID: string;
  address: string;
  pincode: string;
  age_band: string;
  mobileNumber?: string;
  maskedMobileNumber?: string;
  IsUidSame: string;
}

export interface ApiResponse {
  status: boolean;
  data: AadharData[];
  message: string;
}

type UploadSide = "front" | "back";

interface UploadState {
  file: File | null;
  preview: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Main App
function App() {
  const [frontImage, setFrontImage] = useState<UploadState>({
    file: null,
    preview: null,
  });
  const [backImage, setBackImage] = useState<UploadState>({
    file: null,
    preview: null,
  });
  const [parsedData, setParsedData] = useState<AadharData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasParsed, setHasParsed] = useState<boolean>(false);
  const [imageHashes, setImageHashes] = useState<{
    front: string;
    back: string;
  }>({
    front: "",
    back: "",
  });
  const previewsRef = useRef<string[]>([]);

  const updateImageState = useCallback(
    (type: UploadSide, file: File | null) => {
      const setter = type === "front" ? setFrontImage : setBackImage;
      setter((prev) => {
        if (prev.preview) {
          URL.revokeObjectURL(prev.preview);
          previewsRef.current = previewsRef.current.filter(
            (url) => url !== prev.preview
          );
        }

        if (!file) {
          // Clear parsed data if image is removed
          if (hasParsed) {
            setParsedData(null);
            setHasParsed(false);
          }
          // Update hash for the removed image
          setImageHashes((prev) => ({
            ...prev,
            [type]: "",
          }));
          return { file: null, preview: null };
        }

        const preview = URL.createObjectURL(file);
        previewsRef.current.push(preview);

        // Generate hash for the file to detect changes
        const fileHash = `${file.name}-${file.size}-${file.lastModified}`;

        // Check if image has changed after parsing
        if (hasParsed && imageHashes[type] !== fileHash) {
          setParsedData(null);
          setHasParsed(false);
        }

        // Update hash for the new image
        setImageHashes((prev) => ({
          ...prev,
          [type]: fileHash,
        }));

        return { file, preview };
      });
      setError(null);
    },
    [hasParsed, imageHashes]
  );

  const handleImageUpload =
    (type: UploadSide) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      updateImageState(type, file);
      setError(null);
    };

  const handleRemove = (type: UploadSide) => () => {
    updateImageState(type, null);
  };

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewsRef.current = [];
    };
  }, []);

  const canSubmit = useMemo(() => {
    // Must have both images
    if (!frontImage.file || !backImage.file) {
      return false;
    }

    // If already parsed, check if images have changed
    if (hasParsed) {
      const currentFrontHash = frontImage.file
        ? `${frontImage.file.name}-${frontImage.file.size}-${frontImage.file.lastModified}`
        : "";
      const currentBackHash = backImage.file
        ? `${backImage.file.name}-${backImage.file.size}-${backImage.file.lastModified}`
        : "";

      // Only allow submit if images have changed
      return (
        currentFrontHash !== imageHashes.front ||
        currentBackHash !== imageHashes.back
      );
    }

    // If not parsed yet, allow submit if both images are present
    return true;
  }, [frontImage.file, backImage.file, hasParsed, imageHashes]);

  const handleParse = async () => {
    if (!frontImage.file || !backImage.file) {
      setError("Please upload both front and back images.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("front_image", frontImage.file);
    formData.append("back_image", backImage.file);

    try {
      const response = await axios.post(`${API_BASE_URL}/ocr/parse`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const responseData: ApiResponse = response.data;
      if (
        responseData &&
        responseData.data &&
        Array.isArray(responseData.data) &&
        responseData.data.length > 0
      ) {
        setParsedData(responseData.data[0] as AadharData);
        setHasParsed(true);

        if (frontImage.file && backImage.file) {
          const frontHash = `${frontImage.file.name}-${frontImage.file.size}-${frontImage.file.lastModified}`;
          const backHash = `${backImage.file.name}-${backImage.file.size}-${backImage.file.lastModified}`;
          setImageHashes({ front: frontHash, back: backHash });
        }
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as
          | { error?: { message?: string }; message?: string }
          | undefined;
        const message =
          errorData?.error?.message ??
          errorData?.message ??
          "Failed to validate Aadhaar. Try again.";
        setError(message);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {error && <Toast message={error} onClose={() => setError(null)} />}

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            <UploadCard
              title="Aadhaar Front"
              id="front"
              preview={frontImage.preview}
              onUpload={handleImageUpload("front")}
              onRemove={handleRemove("front")}
            />

            <UploadCard
              title="Aadhaar Back"
              id="back"
              preview={backImage.preview}
              onUpload={handleImageUpload("back")}
              onRemove={handleRemove("back")}
            />

            <button
              onClick={handleParse}
              disabled={!canSubmit || loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                hasParsed && !canSubmit
                  ? "Change an image to parse again"
                  : !canSubmit
                  ? "Please upload both front and back images"
                  : ""
              }
            >
              {loading
                ? "PROCESSING..."
                : hasParsed && canSubmit
                ? "PARSE AGAIN"
                : "PARSE AADHAAR"}
            </button>
          </div>

          <div>
            <ParsedDataSection data={parsedData} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
