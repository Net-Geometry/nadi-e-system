import { BUCKET_NAME_SITE_CLAIM, supabase } from "@/integrations/supabase/client";

type ItemData = {
    id: number;
    name: string;
    need_support_doc: boolean;
    need_summary_report: boolean;
    summary_report_file: File | null;
    suppport_doc_file: File[] | null;
    status_item: boolean;
    remark: string;
    site_ids: number[];
};

type CategoryData = {
    id: number;
    name: string;
    item_ids: ItemData[];
};

type FormData = {
    claim_type: string;
    year: number;
    quarter: number;
    month: number;
    ref_no: string;
    tp_dusp_id: string;
    tp_name: string;
    dusp_name: string;
    phase_id: number;
    category_ids: CategoryData[];
    is_finished_generate: boolean;
};

export const insertClaimData = async (data: FormData) => {
    try {
        // Step 1: Get the current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error("Error fetching user:", userError);
            throw new Error("Failed to fetch user");
        }
        const createdBy = userData.user.id;

        // Step 2: Insert into nd_claim_application
        const { data: claimApplication, error: claimApplicationError } = await supabase
            .from("nd_claim_application")
            .insert({
                phase_id: data.phase_id,
                claim_status: 1,
                year: data.year,
                quarter: data.quarter,
                month: data.month,
                ref_no: data.ref_no,
                payment_status: false,
                created_by: createdBy,
                tp_dusp_id: data.tp_dusp_id,
                claim_type: data.claim_type,
            })
            .select("id")
            .single();

        if (claimApplicationError) {
            console.error("Error inserting into nd_claim_application:", claimApplicationError);
            throw new Error("Failed to insert into nd_claim_application");
        }
        const claimId = claimApplication.id;

        // Step 3: Process each category and item
        for (const category of data.category_ids) {
            for (const item of category.item_ids) {
                // Step 3.1: Insert into nd_claim_request
                const { data: claimRequest, error: claimRequestError } = await supabase
                    .from("nd_claim_request")
                    .insert({
                        category_id: category.id,
                        item_id: item.id,
                        status_item: item.status_item ?? false,
                        remark: item.remark,
                        site_ids: item.site_ids,
                        created_by: createdBy,
                        application_id: claimId,
                    })
                    .select("id")
                    .single();

                if (claimRequestError) {
                    console.error("Error inserting into nd_claim_request:", claimRequestError);
                    throw new Error("Failed to insert into nd_claim_request");
                }
                const requestId = claimRequest.id;

                // Step 3.2: Upload summary_report_file to storage
                if (item.summary_report_file) {
                    const fileName = `summary_${Date.now()}_${item.summary_report_file.name}`;
                    const filePath = `${data.dusp_name}/${data.tp_name}/${data.year}/${data.ref_no}_${fileName}`;

                    const fileBlob = new Blob([item.summary_report_file], { type: "application/pdf" });

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
                            request_id: requestId,
                            claim_type_id: 2, // Summary report
                            file_path: filePath,
                        });

                    if (attachmentError) {
                        console.error("Error inserting summary_report_file into nd_claim_attachment:", attachmentError);
                        throw new Error("Failed to insert summary_report_file into nd_claim_attachment");
                    }
                }

                // Step 3.3: Upload suppport_doc_file to storage
                if (item.suppport_doc_file && item.suppport_doc_file.length > 0) {
                    for (const file of item.suppport_doc_file) {
                        const fileName = `support_${Date.now()}_${file.name}`;
                        const filePath = `${data.dusp_name}/${data.tp_name}/${data.year}/${data.ref_no}_${fileName}`;

                        const fileBlob = new Blob([file], { type: "application/pdf" });

                        const { error: uploadError } = await supabase.storage
                            .from(BUCKET_NAME_SITE_CLAIM)
                            .upload(filePath, fileBlob);

                        if (uploadError) {
                            console.error("Error uploading suppport_doc_file:", uploadError);
                            throw new Error("Failed to upload suppport_doc_file");
                        }

                        // Insert into nd_claim_attachment
                        const { error: attachmentError } = await supabase
                            .from("nd_claim_attachment")
                            .insert({
                                request_id: requestId,
                                claim_type_id: 1, // Supporting document
                                file_path: filePath,
                            });

                        if (attachmentError) {
                            console.error("Error inserting suppport_doc_file into nd_claim_attachment:", attachmentError);
                            throw new Error("Failed to insert suppport_doc_file into nd_claim_attachment");
                        }
                    }
                }
            }
        }

        // Step 4: Insert into nd_claim_log
        const { error: logError } = await supabase
            .from("nd_claim_log")
            .insert({
                claim_id: claimId,
                status_id: 1,
                remark: "Drafting claim application",
                created_by: createdBy,
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