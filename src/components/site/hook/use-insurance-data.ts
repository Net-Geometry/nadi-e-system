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
