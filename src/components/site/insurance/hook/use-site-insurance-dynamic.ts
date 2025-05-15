import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InsuranceData {
  id: number;
  description: string;
  type_id: number;
  type_name: string;
  insurance_type_id: number;
  insurance_type_name: string;
  report_detail: string;
  file_path: string;
  start_date: string | null;
  end_date: string | null;
  sitename?: string;
  fullname?: string;
  standard_code?: string;
}

export const useSiteInsuranceDynamic = (siteIds: string[], refresh: boolean) => {
  const [data, setData] = useState<InsuranceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsuranceData = async () => {
      try {
        setLoading(true);

        // Fetch site remarks
        let remarksQuery = supabase
          .from("nd_site_remark")
          .select("id, description, type_id, site_id")
          .in("site_id", siteIds.map(Number));

        const { data: siteRemarks, error: siteRemarksError } = await remarksQuery;

        if (siteRemarksError) throw siteRemarksError;
        if (!siteRemarks || siteRemarks.length === 0) {
          setData([]);
          return;
        }

        // Fetch incident types
        const typeIds = siteRemarks.map((remark) => remark.type_id);
        const { data: incidentTypes, error: incidentTypesError } = await supabase
          .from("nd_incident_type")
          .select("id, name")
          .in("id", typeIds);

        if (incidentTypesError) throw incidentTypesError;

        // Map type names to site remarks
        const remarksWithTypes = siteRemarks.map((remark) => ({
          ...remark,
          type_name: incidentTypes.find((type) => type.id === remark.type_id)?.name || "N/A",
        }));

        // Fetch insurance reports
        const remarkIds = siteRemarks.map((remark) => remark.id);
        const { data: insuranceReports, error: insuranceReportsError } = await supabase
          .from("nd_insurance_report")
          .select("site_remark_id, insurance_type_id, report_detail, start_date, end_date")
          .in("site_remark_id", remarkIds);

        if (insuranceReportsError) throw insuranceReportsError;

        // Fetch insurance coverage types
        const insuranceTypeIds = insuranceReports.map((report) => report.insurance_type_id);
        const { data: insuranceTypes, error: insuranceTypesError } = await supabase
          .from("nd_insurance_coverage_type")
          .select("id, name")
          .in("id", insuranceTypeIds);

        if (insuranceTypesError) throw insuranceTypesError;

        // Map insurance type names to reports
        const reportsWithTypes = insuranceReports.map((report) => ({
          ...report,
          insurance_type_name: insuranceTypes.find((type) => type.id === report.insurance_type_id)?.name || "N/A",
        }));

        // Fetch attachments
        const { data: attachments, error: attachmentsError } = await supabase
          .from("nd_site_attachment")
          .select("site_remark_id, file_path")
          .in("site_remark_id", remarkIds);

        if (attachmentsError) throw attachmentsError;

        // Combine all data
        const insuranceData = remarksWithTypes.map((remark) => {
          const report = reportsWithTypes.find((r) => r.site_remark_id === remark.id) || {} as Partial<typeof reportsWithTypes[number]>;
          const attachment = attachments.find((a) => a.site_remark_id === remark.id) || { file_path: "" };
          return {
            id: remark.id,
            description: remark.description,
            type_id: remark.type_id,
            type_name: remark.type_name,
            insurance_type_id: report.insurance_type_id || 0,
            insurance_type_name: report.insurance_type_name || "N/A",
            report_detail: report.report_detail || "",
            file_path: attachment.file_path || "",
            start_date: report.start_date || null,
            end_date: report.end_date || null,
            site_id: remark.site_id,
          };
        });

        // Fetch site profile names
        const siteIdSet = new Set(insuranceData.map((data) => data.site_id));
        const uniqueSiteIds = Array.from(siteIdSet);
        const { data: siteProfiles, error: siteProfilesError } = await supabase
          .from("nd_site_profile_name")
          .select("id, sitename, fullname, standard_code")
          .in("id", uniqueSiteIds);

        if (siteProfilesError) throw siteProfilesError;

        // Map insurance data with site profile details
        const finalData = insuranceData.map((data) => {
          const siteInfo = siteProfiles.find((site) => site.id === data.site_id);
          return {
            ...data,
            sitename: siteInfo?.sitename || "N/A",
            fullname: siteInfo?.fullname || "N/A",
            standard_code: siteInfo?.standard_code || "N/A",
          };
        });

        setData(finalData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsuranceData();
  }, [siteIds, refresh]); // Added refresh to dependency array

  return { data, loading, error };
};