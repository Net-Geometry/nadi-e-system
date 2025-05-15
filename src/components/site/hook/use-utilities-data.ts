import { useState, useEffect } from 'react';
import { BUCKET_NAME_UTILITIES, supabase, SUPABASE_URL } from '@/integrations/supabase/client';

export const useFetchUtilityTypes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUtilityTypes = async () => {
      try {
        const { data, error } = await supabase.from('nd_type_utilities').select('*');
        if (error) throw error;
        setData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUtilityTypes();
  }, []);

  return { data, loading, error };
};

export const useInsertBillingData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insertBillingData = async (utilityData: any, selectedFile: File | null, utilityTypes: any[], siteId: string) => {
    setLoading(true);
    try {
      // Step 1: Insert into nd_utilities and retrieve the new ID
      const { data: insertedUtility, error: utilityError } = await supabase
        .from("nd_utilities")
        .insert([utilityData])
        .select("id")
        .single(); // Ensure we get only one record

      if (utilityError || !insertedUtility?.id) {
        throw new Error("Failed to insert into nd_utilities or retrieve its ID.");
      }

      const utilityId = insertedUtility.id;

      // Step 2: Upload file to Supabase Storage if a file is selected
      if (selectedFile) {
        const fileName = `${utilityData.year}_${utilityData.month}_${utilityTypes.find(type => type.id === parseInt(utilityData.type_id))?.name}_${Date.now()}.pdf`;
        const filePath = `${siteId}/${utilityData.year}/${utilityTypes.find(type => type.id === parseInt(utilityData.type_id))?.name}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME_UTILITIES)
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Step 3: Get the public URL of the uploaded file
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME_UTILITIES}/${filePath}`;

        // Step 4: Insert into nd_utilities_attachment
        const { error: attachmentError } = await supabase
          .from("nd_utilities_attachment")
          .insert([{ utilities_id: utilityId, file_path: publicUrl }]);

        if (attachmentError) throw attachmentError;
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  return { insertBillingData, loading, error };
};

export const useUpdateBillingData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBillingData = async (utilityId: number, utilityData: any, selectedFile: File | null, utilityTypes: any[], siteId: string) => {
    setLoading(true);
    try {
      // Step 1: Update nd_utilities
      const { error: utilityError } = await supabase
        .from("nd_utilities")
        .update(utilityData)
        .eq("id", utilityId);

      if (utilityError) {
        throw new Error("Failed to update nd_utilities.");
      }

      // Step 2: Handle file upload if a new file is selected
      if (selectedFile) {
        // Fetch the existing file path
        const { data: existingAttachment, error: fetchError } = await supabase
          .from("nd_utilities_attachment")
          .select("file_path")
          .eq("utilities_id", utilityId)
          .single();

        if (fetchError) throw fetchError;

        // Delete the existing file from storage
        const existingFilePath = existingAttachment.file_path.replace(
          `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME_UTILITIES}/`,
          ''
        ).replace(/^\/+/, ''); // remove leading slashes

        console.log("Deleting file at path:", existingFilePath); // Debugging line
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME_UTILITIES)
          .remove([existingFilePath]);

        if (deleteError) throw deleteError;

        // Upload the new file to Supabase Storage
        const fileName = `${utilityData.year}_${utilityData.month}_${utilityTypes.find(type => type.id === parseInt(utilityData.type_id))?.name}_${Date.now()}.pdf`;
        const filePath = `${siteId}/${utilityData.year}/${utilityTypes.find(type => type.id === parseInt(utilityData.type_id))?.name}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME_UTILITIES)
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Get the public URL of the uploaded file
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME_UTILITIES}/${filePath}`;

        // Update nd_utilities_attachment with the new file path
        const { error: attachmentError } = await supabase
          .from("nd_utilities_attachment")
          .update({ file_path: publicUrl })
          .eq("utilities_id", utilityId);

        if (attachmentError) throw attachmentError;
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  return { updateBillingData, loading, error };
};


export const useDeleteBillingData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBillingData = async (billingId: string, toast: any) => {
    setLoading(true);
    try {
      // Fetch the associated file path
      const { data: attachmentData, error: attachmentError } = await supabase
        .from("nd_utilities_attachment")
        .select("file_path")
        .eq("utilities_id", billingId)
        .single();

      if (attachmentError) {
        console.warn("No associated file found or error fetching file path:", attachmentError);
      } else if (attachmentData?.file_path) {
        const filePath = attachmentData.file_path;
        const relativeFilePath = filePath.split(`${BUCKET_NAME_UTILITIES}/`)[1];

        // Delete the file from storage
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME_UTILITIES)
          .remove([relativeFilePath]);

        if (storageError) {
          throw new Error("Failed to delete the associated file.");
        }
      }

      // Delete the billing record
      const { error } = await supabase
        .from("nd_utilities")
        .delete()
        .eq("id", billingId);

      if (error) {
        throw new Error("Failed to delete the billing record.");
      }

      toast({
        title: "Success",
        description: "Record and associated file deleted successfully.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Error deleting billing data:", err);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { deleteBillingData, loading, error };
};