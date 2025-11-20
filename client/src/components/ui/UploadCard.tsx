import { Upload, X } from "lucide-react";

interface UploadCardProps {
  title: string;
  id: string;
  preview: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

function UploadCard({
  title,
  preview,
  onUpload,
  onRemove,
  id,
}: UploadCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-xs font-normal text-gray-500 mb-4">{title}</h3>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={preview}
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-gray-700 text-white p-1.5 rounded-full hover:bg-gray-800 shadow-lg z-10"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition bg-white"
        >
          <Upload className="text-blue-500 mb-2" size={40} />
          <span className="text-sm text-blue-600 font-medium">
            Click here to upload/Capture
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id={id}
            onChange={onUpload}
          />
        </label>
      )}
    </div>
  );
}
export default UploadCard;
