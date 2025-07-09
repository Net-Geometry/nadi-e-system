import { supabase } from "@/integrations/supabase/client";
import { deleteAttachment } from "../../hook/upload-attachment";


export const updateClaimApplication = async (id: number, phase_id: number) => {
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
                phase_id: phase_id,
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

type UpsertClaimRequestData = {
    category_id?: number;
    remark?: string;
    application_id: number;
    item_id: number;
    site_ids?: number[];
};

export const upsertClaimRequest = async (data: UpsertClaimRequestData) => {
    try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error("Error fetching user:", userError);
            throw new Error("Failed to fetch user");
        }
        const userId = userData.user.id;

        // Upsert into nd_claim_request
        const { error: upsertError } = await supabase
            .from("nd_claim_request")
            .upsert({
                category_id: data.category_id,
                remark: data.remark,
                application_id: data.application_id,
                item_id: data.item_id,
                site_ids: data.site_ids,
                updated_at: new Date().toISOString(),
                updated_by: userId,
            }, {
                onConflict: "item_id,application_id"
            });

        if (upsertError) {
            console.error("Error upserting claim request:", upsertError);
            throw new Error("Failed to upsert claim request");
        }

        return { success: true };
    } catch (error) {
        console.error("Error in upsertClaimRequest function:", error);
        throw error;
    }
};

type DeleteClaimRequestData = {
    item_id: number;
    application_id: number;
};


export const deleteClaimRequest = async (data: DeleteClaimRequestData) => {
    try {
        // First, get the nd_claim_request.id (requestId)
        const { data: claimRequest, error: selectError } = await supabase
            .from("nd_claim_request")
            .select("id")
            .match({
                item_id: data.item_id,
                application_id: data.application_id,
            })
            .single();

        if (selectError) {
            console.error("Error selecting claim request:", selectError);
            throw new Error("Failed to find claim request");
        }

        if (!claimRequest) {
            console.error("No claim request found for the given item_id and application_id");
            throw new Error("Claim request not found");
        }

        const requestId = claimRequest.id;

        // Get all attachment IDs where request_id = requestId
        const { data: attachments, error: attachmentError } = await supabase
            .from("nd_claim_attachment")
            .select("id")
            .eq("request_id", requestId);

        if (attachmentError) {
            console.error("Error fetching attachments:", attachmentError);
            throw new Error("Failed to fetch attachments");
        }

        // Delete all attachments if they exist
        if (attachments && attachments.length > 0) {
            const fileIds = attachments.map(attachment => attachment.id);
            
            // Delete each attachment using the exported function
            for (const fileId of fileIds) {
                await deleteAttachment(fileId);
            }
        }

        // Finally, delete the nd_claim_request
        const { error: deleteError } = await supabase
            .from("nd_claim_request")
            .delete()
            .match({
                item_id: data.item_id,
                application_id: data.application_id,
            });

        if (deleteError) {
            console.error("Error deleting claim request:", deleteError);
            throw new Error("Failed to delete claim request");
        }

        return { success: true };
    } catch (error) {
        console.error("Error in deleteClaimRequest function:", error);
        throw error;
    }
};
