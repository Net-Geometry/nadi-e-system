import { supabase, BUCKET_NAME_SITE_CLAIM } from "@/integrations/supabase/client";

export const updateClaimReport = async (id: number) => {
    try {
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error("Error fetching user:", userError);
            throw new Error("Failed to fetch user");
        }
        const userId = userData.user.id;

        // Perform update
        const { error: updateError } = await supabase
            .from("nd_claim_application")
            .update({
                updated_at: new Date().toISOString(),
                updated_by: userId,
            })
            .eq("id", id);

        if (updateError) {
            console.error("Error updating claim application:", updateError);
            throw new Error("Failed to update claim application");
        }

        return { success: true };
    } catch (error) {
        console.error("Error in updateClaimApplication function:", error);
        throw error;
    }
};


export const updateRemark = async (requestId: number, remark: string) => {
  try {
    // Update the remark in the nd_claim_request table
    const { error: dbError } = await supabase
      .from("nd_claim_request")
      .update({ remark })
      .eq("id", requestId);

    if (dbError) {
      console.error("Error updating remark in nd_claim_request:", dbError);
      throw new Error("Failed to update remark in nd_claim_request");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateRemark function:", error);
    return { success: false, error };
  }
};

export const uploadAttachment = async (
  file: File,
  tpDuspId: { parent_id: { name: string }; name: string }, // tp_dusp_id object
  year: number,
  refNo: string,
  requestId: number,
  claimTypeId: number // 1 for supporting document, 2 for summary report
) => {
  try {
    // Construct the file name and file path
    const fileName = `support_${Date.now()}_${file.name}`;
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
        request_id: requestId,
        claim_type_id: claimTypeId,
        file_path: filePath,
      });

    if (dbError) {
      console.error("Error inserting into nd_claim_attachment:", dbError);
      throw new Error("Failed to insert into nd_claim_attachment");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in uploadAttachment function:", error);
    return { success: false, error };
  }
};
