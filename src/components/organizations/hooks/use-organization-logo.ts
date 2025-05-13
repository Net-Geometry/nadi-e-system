import { useState, useEffect } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { supabase } from "@/integrations/supabase/client";

export function useOrganizationLogo(initialLogoUrl: string = "") {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialLogoUrl || "");
  const { isUploading, uploadFile } = useFileUpload();

  // Update previewUrl when initialLogoUrl changes (when editing an organization)
  useEffect(() => {
    if (initialLogoUrl && initialLogoUrl !== previewUrl) {
      setPreviewUrl(initialLogoUrl);
    }
  }, [initialLogoUrl]);

  // Handle logo file selection
  const handleLogoChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];

      // Verify we have an image file with proper MIME type
      if (!file.type.startsWith("image/")) {
        console.warn(`File does not have an image MIME type: ${file.type}`);
        return; // Don't allow non-image files
      }

      console.log(
        `Selected logo file: ${file.name}, type: ${file.type}, size: ${file.size}`
      );
      setLogoFile(file);

      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Remove the selected logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setPreviewUrl("");
  };

  // Upload logo and get URL
  const uploadLogo = async () => {
    if (!logoFile) return previewUrl || null;

    try {
      console.log(
        `Uploading logo file: ${logoFile.name}, type: ${logoFile.type}`
      );

      // Verify one more time that it's an image type
      if (!logoFile.type.startsWith("image/")) {
        console.error(`Cannot upload non-image file: ${logoFile.type}`);
        return null;
      }

      const userData = await supabase.auth.getUser();
      const userId = userData.data.user?.id;
      const folder = userId || "anonymous";

      // Pass the file directly to the uploadFile function
      const url = await uploadFile(logoFile, "organization_logos", folder);
      console.log(`Logo uploaded, URL: ${url}`);
      return url;
    } catch (error) {
      console.error("Error uploading logo:", error);
      return null;
    }
  };

  return {
    logoFile,
    previewUrl,
    isUploading,
    handleLogoChange,
    handleRemoveLogo,
    uploadLogo,
  };
}
