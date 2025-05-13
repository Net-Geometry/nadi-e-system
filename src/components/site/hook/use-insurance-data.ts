import { useState, useEffect } from "react";
import {
  SUPABASE_URL,
  BUCKET_NAME_SITE_INSURANCE,
} from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";

export const useFetchInsuranceTypes = () => {
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [insuranceCoverageTypes, setInsuranceCoverageTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        // Fetch incident types
        const { data: incidentData, error: incidentError } = await supabase
          .from("nd_incident_type")
          .select("*");
        if (incidentError) throw incidentError;

        // Fetch insurance coverage types
        const { data: insuranceData, error: insuranceError } = await supabase
          .from("nd_insurance_coverage_type")
          .select("*");
        if (insuranceError) throw insuranceError;

        setIncidentTypes(incidentData);
        setInsuranceCoverageTypes(insuranceData);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  return { incidentTypes, insuranceCoverageTypes, loading, error };
};

export const useInsertInsuranceData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insertInsuranceData = async (insuranceData, selectedFile, siteId) => {
    setLoading(true);
    try {
      // Step 1: Insert into nd_site_remark
      const { data: siteRemark, error: siteRemarkError } = await supabase
        .from("nd_site_remark")
        .insert([
          {
            site_id: insuranceData.site_id,
            description: insuranceData.description,
            type_id: insuranceData.type_id,
          },
        ])
        .select("id")
        .single();

      if (siteRemarkError || !siteRemark?.id) {
        throw new Error("Failed to insert into nd_site_remark.");
      }

      const siteRemarkId = siteRemark.id;

      // Step 2: Insert into nd_insurance_report
      const { error: insuranceReportError } = await supabase
        .from("nd_insurance_report")
        .insert([
          {
            site_remark_id: siteRemarkId,
            insurance_type_id: insuranceData.insurance_type_id,
            report_detail: insuranceData.report_detail, // Save report_detail
            start_date: insuranceData.start_date, // Save start_date
            end_date: insuranceData.end_date, // Save end_date
          },
        ]);

      if (insuranceReportError) {
        throw new Error("Failed to insert into nd_insurance_report.");
      }

      // Step 3: Upload file to Supabase Storage
      let publicUrl = null;
      if (selectedFile) {
        const fileName = `${siteRemarkId}_${Date.now()}.pdf`;
        const filePath = `site-insurance/${siteId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME_SITE_INSURANCE)
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME_SITE_INSURANCE}/${filePath}`;
      }

      // Step 4: Insert into nd_site_attachment
      if (publicUrl) {
        const { error: attachmentError } = await supabase
          .from("nd_site_attachment")
          .insert([{ site_remark_id: siteRemarkId, file_path: publicUrl }]);

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

  return { insertInsuranceData, loading, error };
};

export const useUpdateInsuranceData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInsuranceData = async (
    siteRemarkId,
    insuranceData,
    selectedFile,
    siteId
  ) => {
    setLoading(true);
    try {
      // Step 1: Update nd_site_remark
      const { error: siteRemarkError } = await supabase
        .from("nd_site_remark")
        .update({
          description: insuranceData.description,
          type_id: insuranceData.type_id,
        })
        .eq("id", siteRemarkId);

      if (siteRemarkError) {
        throw new Error("Failed to update nd_site_remark.");
      }

      // Step 2: Update nd_insurance_report
      const { error: insuranceReportError } = await supabase
        .from("nd_insurance_report")
        .update({
          insurance_type_id: insuranceData.insurance_type_id,
          report_detail: insuranceData.report_detail, // Update report_detail
          start_date: insuranceData.start_date, // Update start_date
          end_date: insuranceData.end_date, // Update end_date
        })
        .eq("site_remark_id", siteRemarkId);

      if (insuranceReportError) {
        throw new Error("Failed to update nd_insurance_report.");
      }

      // Step 3: Handle file upload
      if (selectedFile) {
        console.log("Selected File:", selectedFile);
        const fileName = `${siteRemarkId}_${Date.now()}.pdf`;
        const filePath = `site-insurance/${siteId}/${fileName}`;

        // Use the selectedFile directly
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME_SITE_INSURANCE)
          .upload(filePath, selectedFile, {
            contentType: selectedFile.type, // Use the file's MIME type
          });

        if (uploadError) throw uploadError;

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME_SITE_INSURANCE}/${filePath}`;

        // Step 4: Update nd_site_attachment
        const { error: attachmentError } = await supabase
          .from("nd_site_attachment")
          .update({ file_path: publicUrl })
          .eq("site_remark_id", siteRemarkId);

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
  return { updateInsuranceData, loading, error };
};

export const useDeleteInsuranceData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteInsuranceData = async (deleteRecordId: string, toast: any) => {
    setLoading(true);
    try {
      // Step 1: Delete from `nd_site_attachment` and get file path
      const { data: attachmentData, error: attachmentError } = await supabase
        .from("nd_site_attachment")
        .select("file_path")
        .eq("site_remark_id", deleteRecordId)
        .single();

      if (attachmentError) {
        console.warn(
          "No associated file found or error fetching file path:",
          attachmentError
        );
      } else if (attachmentData?.file_path) {
        const filePath = attachmentData.file_path;

        // Extract the part of the file path after the bucket name
        const relativeFilePath = filePath.split(
          `${BUCKET_NAME_SITE_INSURANCE}/`
        )[1];

        // Step 2: Delete the file from storage
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME_SITE_INSURANCE)
          .remove([relativeFilePath]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          toast({
            title: "Error",
            description:
              "Failed to delete the associated file. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Step 3: Delete the record from `nd_site_attachment`
        const { error: attachmentDeleteError } = await supabase
          .from("nd_site_attachment")
          .delete()
          .eq("site_remark_id", deleteRecordId);

        if (attachmentDeleteError) {
          console.error(
            "Error deleting from nd_site_attachment:",
            attachmentDeleteError
          );
          toast({
            title: "Error",
            description:
              "Failed to delete the attachment record. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Step 4: Delete from `nd_insurance_report`
      const { error: reportError } = await supabase
        .from("nd_insurance_report")
        .delete()
        .eq("site_remark_id", deleteRecordId);

      if (reportError) {
        console.error("Error deleting from nd_insurance_report:", reportError);
        toast({
          title: "Error",
          description:
            "Failed to delete the insurance report. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Step 5: Delete from `nd_site_remark`
      const { error: remarkError } = await supabase
        .from("nd_site_remark")
        .delete()
        .eq("id", deleteRecordId);

      if (remarkError) {
        console.error("Error deleting from nd_site_remark:", remarkError);
        toast({
          title: "Error",
          description: "Failed to delete the remark. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Record and associated file deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { deleteInsuranceData, loading, error };
};