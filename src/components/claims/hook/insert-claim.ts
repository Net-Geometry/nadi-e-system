import { BUCKET_NAME_SITE_CLAIM, supabase } from "@/integrations/supabase/client";

type FileData = {
    name: string; // File name
    url: string;  // File URL or path
};

type ClaimData = {
    tp_dusp_id: string;
    dusp_name: string;
    tp_name: string;
    phase_id?: string;
    refid_mcmc: string;
    claim_status: boolean | string | null;
    year: string;
    quarter: string;
    month: string;
    ref_no: string;
    payment_status: boolean;

    category_id: string;
    item_id: string;
    status_item: boolean | string | null;
    request_remark: string;
    need_support_doc: boolean | string | null;
    need_summary_report: boolean | string | null;
    claim_type_id_support: string;
    file_path_support: FileData[];
    claim_type_id_summary: string;
    file_path_summary: FileData[];
};


export const insertClaimData = async (data: ClaimData) => {
    try {
        // Insert into nd_claim_application
        const { data: claimApplication, error: claimApplicationError } = await supabase
            .from("nd_claim_application")
            .insert({
                tp_dusp_id: data.tp_dusp_id,
                phase_id: data.phase_id,
                claim_status: data.claim_status,
                year: data.year,
                quarter: data.quarter,
                month: data.month,
                ref_no: data.ref_no,
                payment_status: data.payment_status,
            })
            .select("id")
            .single();

        if (claimApplicationError) {
            console.error("Error inserting into nd_claim_application:", claimApplicationError);
            throw new Error("Failed to insert into nd_claim_application");
        }
        const claimId = claimApplication.id;

        // Insert into nd_claim_request
        const { data: claimRequest, error: claimRequestError } = await supabase
            .from("nd_claim_request")
            .insert({
                category_id: data.category_id,
                item_id: data.item_id,
                status_item: data.status_item,
                remark: data.request_remark,
                application_id: claimId,
            })
            .select("id")
            .single();

        if (claimRequestError) {
            console.error("Error inserting into nd_claim_request:", claimRequestError);
            throw new Error("Failed to insert into nd_claim_request");
        }
        const requestId = claimRequest.id;

        // Upload files to storage and insert into nd_claim_attachment
        const uploadFiles = async (files: FileData[], pathPrefix: string, claimTypeId: string) => {
            for (const file of files) {
                // Extract the file extension from the file name
                const fileExtension = file.name.split('.').pop();
                const fileNameWithoutExtension = file.name.replace(`.${fileExtension}`, '');

                // Construct the file path with the naming convention
                const filePath = `${data.dusp_name}/${data.tp_name}/${data.year}/${data.month}/${pathPrefix}/${fileNameWithoutExtension}_${Date.now()}.${fileExtension}`;

                // Fetch the file as a Blob or binary data
                const response = await fetch(file.url);
                const fileBlob = await response.blob();

                // Upload the file to Supabase storage
                const { error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME_SITE_CLAIM)
                    .upload(filePath, fileBlob);

                if (uploadError) {
                    console.error(`Error uploading file ${file.name} to storage:`, uploadError);
                    throw new Error(`Failed to upload file ${file.name} to storage`);
                }

                // Generate the public URL for the uploaded file
                const publicUrl = `${supabase.storage.from(BUCKET_NAME_SITE_CLAIM).getPublicUrl(filePath).data.publicUrl}`;

                // Insert the file details into the nd_claim_attachment table
                const { error: attachmentError } = await supabase
                    .from("nd_claim_attachment")
                    .insert({
                        request_id: requestId,
                        claim_type_id: claimTypeId,
                        file_path: [publicUrl], // Wrap the public URL in an array
                    });

                if (attachmentError) {
                    console.error(`Error inserting file ${file.name} into nd_claim_attachment:`, attachmentError);
                    throw new Error(`Failed to insert file ${file.name} into nd_claim_attachment`);
                }
            }
        };

        if (data.need_support_doc && data.file_path_support.length > 0) {
            await uploadFiles(data.file_path_support, "supportingdoc", data.claim_type_id_support);
        }

        if (data.need_summary_report && data.file_path_summary.length > 0) {
            await uploadFiles(data.file_path_summary, "summary_report", data.claim_type_id_summary);
        }

        // Insert into nd_claim_log
        const { error: logError } = await supabase
            .from("nd_claim_log")
            .insert({
                claim_id: claimId,
                status_id: data.claim_status,
                remark: data.request_remark,
            });

        if (logError) {
            console.error("Error inserting into nd_claim_log:", logError);
            throw new Error("Failed to insert into nd_claim_log");
        }

        return { success: true };
    } catch (error) {
        console.error("Error in insertClaimData function:", error);
        throw error;
    }
};