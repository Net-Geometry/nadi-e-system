import { BUCKET_NAME_SITE_CLAIM, supabase } from "@/integrations/supabase/client";

type FormData = {
    request_id: number;
    claim_type: string;
    year: number;
    ref_no: string;
    tp_name: string;
    dusp_name: string;
    summary_report_file: File | null;
};

export const submitClaimSummaryReports = async (data: FormData) => {
    try {
        // Step 3.2: Upload summary_report_file to storage
        if (data.summary_report_file) {
            const fileName = `summary_${Date.now()}_${data.summary_report_file.name}`;
            const filePath = `${data.dusp_name}/${data.tp_name}/${data.year}/${data.ref_no}_${fileName}`;

            const fileBlob = new Blob([data.summary_report_file], { type: "application/pdf" });

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME_SITE_CLAIM)
                .upload(filePath, fileBlob);

            if (uploadError) {
                console.error("Error uploading summary_report_file:", uploadError);
                throw new Error("Failed to upload summary_report_file");
            }

            // Insert into nd_claim_attachment
            const { error: attachmentError } = await supabase
                .from("nd_claim_attachment")
                .insert({
                    request_id: data.request_id,
                    claim_type_id: 2, // Summary report
                    file_path: filePath,
                });

            if (attachmentError) {
                console.error("Error inserting summary_report_file into nd_claim_attachment:", attachmentError);
                throw new Error("Failed to insert summary_report_file into nd_claim_attachment");
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error in submitClaimSummaryReports function:", error);
        throw error;
    }
};