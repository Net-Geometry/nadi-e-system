import { supabase } from "@/integrations/supabase/client";

type UpdatePaymentData = {
    claim_id: number;
    claim_status: number;
    payment_status: boolean;
    date_paid: string; // Use ISO string format for the date
    remark: string;
};

export const updatePayment = async (data: UpdatePaymentData) => {
    try {

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error("Error fetching user:", userError);
            throw new Error("Failed to fetch user");
        }
        const createdBy = userData.user.id;

        // Update the payment_status and date_paid in nd_claim_application
        const { error: updateError } = await supabase
            .from("nd_claim_application")
            .update({
                claim_status: data.claim_status,
                payment_status: data.payment_status,
                date_paid: data.date_paid,
                updated_by: createdBy
            })
            .eq("id", data.claim_id);

        if (updateError) {
            console.error("Error updating payment status:", updateError);
            throw new Error("Failed to update payment status");
        }

        // Insert into nd_claim_log
        const { error: logError } = await supabase
            .from("nd_claim_log")
            .insert({
                claim_id: data.claim_id,
                status_id: data.claim_status,
                remark: data.remark,
                created_by: createdBy,

            });

        if (logError) {
            console.error("Error inserting into nd_claim_log:", logError);
            throw new Error("Failed to insert into nd_claim_log");
        }

        return { success: true };
    } catch (error) {
        console.error("Error in updatePayment function:", error);
        throw error;
    }
};