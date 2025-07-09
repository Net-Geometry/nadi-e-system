import { supabase, BUCKET_NAME_SITE_CLAIM } from "@/integrations/supabase/client";


export const deleteAttachment = async (fileId: number) => {
  try {
    // Step 1: Get file_path from nd_claim_attachment
    const { data, error: fetchError } = await supabase
      .from("nd_claim_attachment")
      .select("file_path")
      .eq("id", fileId)
      .single();

    if (fetchError || !data?.file_path) {
      console.error("Error fetching file_path:", fetchError);
      throw new Error("Failed to fetch file_path from nd_claim_attachment");
    }

    const filePath = data.file_path;

    // Step 2: Delete file from Supabase storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME_SITE_CLAIM)
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      throw new Error("Failed to delete file from storage");
    }

    // Step 3: Delete metadata from nd_claim_attachment
    const { error: dbError } = await supabase
      .from("nd_claim_attachment")
      .delete()
      .eq("id", fileId);

    if (dbError) {
      console.error("Error deleting from nd_claim_attachment:", dbError);
      throw new Error("Failed to delete from nd_claim_attachment");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteAttachment function:", error);
    return { success: false, error };
  }
};


export const uploadSignDoc = async (
  file: File,
  tpDuspId: { parent_id: { name: string }; name: string }, // tp_dusp_id object
  year: number,
  refNo: string,
  claimId: number, // Accept claimId instead of requestId
  claimTypeId: number // 1 for supporting document, 2 for summary report, 3 for signed documents
) => {
  try {
    // Construct the file name and file path
    const fileName = `signed_${Date.now()}_${file.name}`;
    const filePath = `${tpDuspId.parent_id.name}/${tpDuspId.name}/${year}/${refNo}_${fileName}`;

    // Step 1: Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME_SITE_CLAIM)
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading file to storage:", uploadError);
      throw new Error("Failed to upload file to storage");
    }

    // Step 2: Insert file metadata into nd_claim_attachment
    const { error: dbError } = await supabase
      .from("nd_claim_attachment")
      .insert({
        claim_id: claimId, // Use claimId instead of requestId
        claim_type_id: claimTypeId,
        file_path: filePath,
      });

    if (dbError) {
      console.error("Error inserting into nd_claim_attachment:", dbError);
      throw new Error("Failed to insert into nd_claim_attachment");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in uploadSignDoc function:", error);
    return { success: false, error };
  }
};
