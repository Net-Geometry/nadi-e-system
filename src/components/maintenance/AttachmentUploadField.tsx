import { FileUpload } from "@/components/ui/file-upload";
import { Loader2, Upload, X } from "lucide-react";

interface AttachmentUploadFieldProps {
  previewUrl: string;
  isUploading: boolean;
  onAttachmentChange: (files: File[]) => void;
  onRemoveAttachment: () => void;
}

export function AttachmentUploadField({
  previewUrl,
  isUploading,
  onAttachmentChange,
  onRemoveAttachment,
}: AttachmentUploadFieldProps) {
  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative w-40 h-40 border rounded-md overflow-hidden bg-muted/30 flex items-center justify-center group">
          <img
            src={previewUrl}
            alt="Logo preview"
            className="object-contain w-full h-full p-2"
          />
          <button
            type="button"
            onClick={onRemoveAttachment}
            className="absolute top-2 right-2 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <FileUpload
          acceptedFileTypes="image/png,image/jpeg,image/webp,image/svg+xml"
          maxFiles={1}
          maxSizeInMB={2}
          onFilesSelected={onAttachmentChange}
          buttonText={isUploading ? "Uploading..." : "Upload Logo"}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
        </FileUpload>
      )}
    </div>
  );
}
