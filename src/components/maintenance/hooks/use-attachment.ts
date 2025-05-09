import { useFileUpload } from "@/hooks/use-file-upload";
import { useState } from "react";

export function useAttachment() {
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string>("");
  const { isUploading, uploadFile } = useFileUpload();

  const handleAttachmentChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];

      // Verify we have an image file with proper MIME type
      if (!file.type.startsWith("image/")) {
        console.warn(`File does not have an image MIME type: ${file.type}`);
        return; // Don't allow non-image files
      }

      console.log(
        `Selected attachment file: ${file.name}, type: ${file.type}, size: ${file.size}`
      );
      setAttachmentFile(file);

      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAttachmentPreviewUrl(objectUrl);
    }
  };

  const uploadAttachment = async () => {
    if (!attachmentFile) return attachmentPreviewUrl || null;

    try {
      console.log(
        `Uploading attachment file: ${attachmentFile.name}, type: ${attachmentFile.type}`
      );

      // Verify one more time that it's an image type
      if (!attachmentFile.type.startsWith("image/")) {
        console.error(`Cannot upload non-image file: ${attachmentFile.type}`);
        return null;
      }

      const file = attachmentFile;
      if (!file) return;

      const url = await uploadFile(
        file,
        "maintenance-attachment",
        "maintenance"
      );

      return url;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      return null;
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreviewUrl("");
  };

  return {
    attachmentFile,
    attachmentPreviewUrl,
    isUploading,
    handleAttachmentChange,
    handleRemoveAttachment,
    uploadAttachment,
  };
}
