import { useQuery } from "@tanstack/react-query";
import { BUCKET_NAME_SITE_CLAIM, supabase, SUPABASE_BUCKET_URL } from "@/integrations/supabase/client";

export const useFetchClaimById = (id: number) => {
  return useQuery({
    queryKey: ["fetchClaimById", id],
    queryFn: async () => {
      if (!id) return null;

      try {
        // Step 1: Fetch data from nd_claim_application
        const { data: claimApplication, error: claimAppError } = await supabase
          .from("nd_claim_application")
          .select(`
            id,
            phase_id (id, name),
            claim_status (id, name),
            claim_type,
            year,
            quarter,
            month,
            ref_no,
            date_paid,
            payment_status,
            tp_dusp_id (id, name, parent_id (id, name))
          `)
          .eq("id", id)
          .single();

        if (claimAppError) {
          console.error("Error fetching nd_claim_application:", claimAppError);
          throw new Error("Failed to fetch claim application");
        }

        // Step 2: Fetch data from nd_claim_request
        const { data: claimRequests, error: claimReqError } = await supabase
          .from("nd_claim_request")
          .select(`
            id,
            category_id (id, name),
            item_id (id, name, need_support_doc, need_summary_report),
            status_item,
            remark,
            site_ids,
            application_id
          `)
          .eq("application_id", id);

        if (claimReqError) {
          console.error("Error fetching nd_claim_request:", claimReqError);
          throw new Error("Failed to fetch claim requests");
        }

        // Step 3: Fetch data from nd_claim_attachment for requests
        const requestIds = claimRequests.map((req) => req.id);
        const { data: claimAttachments, error: claimAttachError } = await supabase
          .from("nd_claim_attachment")
          .select(`
            id,
            claim_type_id,
            file_path,
            request_id
          `)
          .in("request_id", requestIds);

        if (claimAttachError) {
          console.error("Error fetching nd_claim_attachment:", claimAttachError);
          throw new Error("Failed to fetch claim attachments");
        }

        // Add prefix to file_path for request attachments
        const updatedClaimAttachments = claimAttachments.map((attachment) => ({
          ...attachment,
          file_path: `${SUPABASE_BUCKET_URL}/${BUCKET_NAME_SITE_CLAIM}/${attachment.file_path}`,
        }));

        // Step 4: Fetch data from nd_claim_attachment for signed documents (claim_type_id = 3)
        const { data: signedDocuments, error: signedDocError } = await supabase
          .from("nd_claim_attachment")
          .select(`
            id,
            file_path
          `)
          .eq("claim_id", id)
          .eq("claim_type_id", 3); // Fetch only signed documents

        if (signedDocError) {
          console.error("Error fetching signed documents:", signedDocError);
          throw new Error("Failed to fetch signed documents");
        }

        // Add prefix to file_path for signed documents
        const updatedSignedDocuments = signedDocuments.map((doc) => ({
          ...doc,
          file_path: `${SUPABASE_BUCKET_URL}/${BUCKET_NAME_SITE_CLAIM}/${doc.file_path}`,
        }));

        // Step 5: Fetch data from nd_claim_log
        const { data: claimLogs, error: claimLogError } = await supabase
          .from("nd_claim_log")
          .select(`
            id,
            status_id (id, name),
            remark,
            created_at,
            created_by (id, email, full_name),
            claim_id
          `)
          .eq("claim_id", id)
          .order("id", { ascending: true });

        if (claimLogError) {
          console.error("Error fetching nd_claim_log:", claimLogError);
          throw new Error("Failed to fetch claim logs");
        }

        // Step 6: Transform data to match the new structure
        const requests = claimRequests.map((req) => ({
          id: req.id, // Use nd_claim_request.id
          category: req.category_id, // Use category_id (id, name) as an object
          item: {
            id: req.item_id.id,
            name: req.item_id.name,
            need_support_doc: req.item_id.need_support_doc,
            need_summary_report: req.item_id.need_summary_report,
            status_item: req.status_item,
            remark: req.remark,
            site_ids: req.site_ids,
            suppport_doc_file: updatedClaimAttachments
              .filter((attach) => attach.request_id === req.id && attach.claim_type_id === 1)
              .map((attach) => ({
                id: attach.id,
                file_path: attach.file_path,
              })),
            summary_report_file: updatedClaimAttachments.find(
              (attach) => attach.request_id === req.id && attach.claim_type_id === 2
            ) || null,
          },
        }));

        // Combine data
        return {
          ...claimApplication,
          requests, // Replace category_ids with requests
          signed_documents: updatedSignedDocuments, // Add signed documents at the same level
          logs: claimLogs,
        };
      } catch (error) {
        console.error("Error in useFetchClaimById function:", error);
        throw error;
      }
    },
    enabled: !!id,
  });
};