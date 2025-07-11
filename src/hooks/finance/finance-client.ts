import { supabase } from "@/lib/supabase";
import { getMonthNameByNumber } from "@/pages/dashboard/finance/utils/getMonthNameByNumber";
import { FinanceReport, FinanceReportItem } from "@/types/finance";

export const financeClient = {
    addNewTransactionReport: async (data: FinanceReport) => {
        const { error } = await supabase
            .from("nd_finance_report")
            .insert(data)
        if (error) {
            console.error(error);
            throw error;
        };
        return data;
    },

    getAllSiteReportStatus: async () => {
        const { data, error } = await supabase
            .from("nd_finance_report_status")
            .select("*")
        if (error) throw error;
        return data
    },

    getAllMonthName: async () => {
        const twelveMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return twelveMonths;
    },

    getAllYearFromTwentyTwenty: async () => {
        const currentYear = new Date().getFullYear();
        const yearOptions = [];
        for (let i = 2020; i <= currentYear; i++) {
            yearOptions.push(i);
        }
        return yearOptions;
    },

    getAllRegion: async () => {
        const { data, error } = await supabase
            .from("nd_region")
            .select("*")
        if (error) throw error;
        return data
    },

    getAllPhases: async () => {
        const { data, error } = await supabase
            .from("nd_phases")
            .select("*")
        if (error) throw error;
        return data
    },

    getFinanceReportWithFilterAndPagination: async (
        year: string,
        month: string,
        search: string,
        status: string,
        phase: string,
        region: string,
        page: number,
        perPage: number,
        tpAdminSiteIds?: number[],
        duspTpSiteId?: number
    ) => {
        const siteIds: number[] = [];
        let statusId: number;
        let regionId: number | undefined;
        let phaseId: number | undefined;
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        if (search !== "") {
            const { data, error } = await supabase
                .from("nd_site_profile")
                .select("id")
                .ilike("sitename", `%${search}%`)
            if (error) {
                console.error(error);
                throw error;
            }
            siteIds.push(...data.map((site: any) => site.id))
        }
        if (status !== "") {
            const { data, error } = await supabase
                .from("nd_finance_report_status")
                .select("id")
                .eq("status", status)
                .single()
            if (error) {
                console.error(error);
                throw error;
            }
            statusId = data.id;
        }
        if (phase !== "") {
            const { data, error } = await supabase
                .from("nd_phases")
                .select("id")
                .eq("name", phase)
            if (error) {
                console.error(error);
                throw error;
            }
            phaseId = data[0].id
        }
        if (region !== "") {
            const { data, error } = await supabase
                .from("nd_region")
                .select("id")
                .eq("eng", region)
            if (error) {
                console.error(error);
                throw error;
            }
            regionId = data[0].id
        }

        let query = supabase
            .from("nd_finance_report")
            .select(`*, nd_site_profile(*, nd_region (*), nd_phases (*)), 
                nd_finance_report_status(*), 
                nd_finance_report_item(*, nd_finance_income_type(*), nd_finance_expense_type(*))
                `)
            .range(from, to);

        if (month != "") query = query.eq("month", month);
        if (year != "") query = query.eq("year", year);
        if (search !== "") query = query.in("site_id", siteIds);
        if (status !== "") query = query.eq("status_id", statusId);
        if (tpAdminSiteIds && tpAdminSiteIds.length > 0) query = query.in("site_id", tpAdminSiteIds);
        if (duspTpSiteId) query = query.eq("site_id", duspTpSiteId);

        const { data, error } = await query;
        if (error) {
            console.error(error);
            throw error;
        };

        const filteredByRegion = data.filter((report: any) => report.nd_site_profile?.nd_region?.id === Number(regionId));
        const filteredByPhase = data.filter((report: any) => report.nd_site_profile?.nd_phases?.id === Number(phaseId));

        if (phase === "" && region === "") {
            return data;
        }

        if (phase !== "" && region !== "") {
            if (filteredByPhase.length === 0 || filteredByRegion.length === 0) {
                return [];
            }

            const uniqueMap = new Map();
            [...filteredByPhase, ...filteredByRegion].forEach(item => {
                uniqueMap.set(item.id, item);
            });

            return Array.from(uniqueMap.values());
        }

        if (phase !== "") {
            return filteredByPhase.length > 0 ? filteredByPhase : [];
        }

        if (region !== "") {
            return filteredByRegion.length > 0 ? filteredByRegion : [];
        }

    },

    getAllFinanceReports: async (tpAdminSiteIds?: number[], duspTpSiteId?: number) => {
        let query = supabase
            .from("nd_finance_report")
            .select(`*, nd_site_profile(*, nd_region (*), nd_phases (*)), nd_finance_report_status(*), nd_finance_report_item(*)`);

        if (tpAdminSiteIds && tpAdminSiteIds.length > 0) query = query.in("site_id", tpAdminSiteIds);
        if (duspTpSiteId) query = query.eq("site_id", duspTpSiteId);

        const { data, error } = await query;
        if (error) {
            console.error(error);
            throw error;
        };

        return data;
    },

    getFinanceReportItemByReportId: async (
        reportId: string,
        page: number,
        perPage: number
    ): Promise<FinanceReportItem[]> => {
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        const { data, error } = await supabase
            .from("nd_finance_report_item")
            .select(`*, 
                nd_finance_income_type(*), 
                nd_finance_expense_type(*), 
                nd_finance_report(*, nd_site_profile(*)),
                nd_pos_transaction(*)`)
            .eq("finance_report_id", reportId)
            .range(from, to);
        if (error) {
            console.error(error);
            throw error;
        };

        return data as FinanceReportItem[];
    },

    postNewFinanceTransactionItem: async (data: any) => {
        const { data: newData, error } = await supabase
            .from("nd_finance_report_item")
            .insert(data)
            .select("*")
            .maybeSingle();
        if (error) {
            console.error(error);
            throw error;
        };
        return newData;
    },

    updateFinanceReportStatus: async (reportId: string, status: string, balanceForward?: number) => {
        const { data: statusData, error: statusError } = await supabase
            .from("nd_finance_report_status")
            .select("*")
            .eq("status", status)
            .maybeSingle();

        if (statusError) {
            console.error(statusError);
            throw statusError;
        }

        const { data, error } = await supabase
            .from("nd_finance_report")
            .update({ status_id: statusData?.id })
            .eq("id", reportId)
            .select("*")
            .maybeSingle();

        if (error) {
            console.error(error);
            throw error;
        };

        if (status === "submitted" && balanceForward !== null) {
            const month = getMonthNameByNumber(new Date().getMonth() + 2);
            const year = new Date().getFullYear().toString();
            const balance_forward = balanceForward;
            const created_at = new Date().toISOString();
            const { data: status_id, error: status_id_error } = await supabase
                .from("nd_finance_report_status")
                .select("id")
                .eq("status", "editing")
                .maybeSingle();

            if (status_id_error) {
                console.error(status_id_error);
                throw status_id_error;
            }
            const { error: createNewReportError } = await supabase
                .from("nd_finance_report")
                .insert({
                    status_id: status_id?.id,
                    site_id: data.site_id,
                    month,
                    year,
                    balance_forward,
                    created_at
                });

            if (createNewReportError) {
                console.error(createNewReportError);
                throw createNewReportError;
            }
        }

        return data;
    },

    getSiteNameByReportId: async (reportId: string) => {
        const { data, error } = await supabase
            .from("nd_finance_report")
            .select(`*, 
                nd_site_profile(*), 
                nd_finance_report_status(*), 
                nd_finance_report_item(*, nd_finance_income_type(*), nd_finance_expense_type(*))
                `)
            .eq("id", reportId)
            .maybeSingle();
        if (error) {
            console.error(error);
            throw error;
        };

        return data as FinanceReport;
    },

    getAllFinanceIncomeTypes: async () => {
        const { data, error } = await supabase
            .from("nd_finance_income_type")
            .select("*");
        if (error) {
            console.error(error);
            throw error;
        };

        return data;
    },

    getAllFinanceExpenseTypes: async () => {
        const { data, error } = await supabase
            .from("nd_finance_expense_type")
            .select("*");
        if (error) {
            console.error(error);
            throw error;
        };

        return data;
    },

    uploadFile: async (file: File) => {
        const bucket = "finance-report";
        const filePath = `${Date.now()}-${file.name}-${crypto.randomUUID()}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) {
            throw new Error("Upload failed: " + error.message);
        }

        const { publicUrl } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(filePath).data;

        return publicUrl;
    },

    editFinanceReportItem: async (data: any, reportItemId: string) => {
        const { error } = await supabase
            .from("nd_finance_report_item")
            .update(data)
            .eq("id", reportItemId);
        if (error) {
            console.error(error);
            throw error;
        };
        return data;
    },

    deleteFinanceItemReport: async (reportItemId: string) => {
        const { error } = await supabase
            .from("nd_finance_report_item")
            .delete()
            .eq("id", reportItemId);
        if (error) {
            console.error(error);
            throw error;
        };
        return reportItemId;
    },

    getAllSiteReports: async (siteId: number, siteIds?: number[]) => {
        let query = supabase
            .from("nd_site_profile")
            .select(`*,
                nd_region(*),
                nd_phases(*),
                nd_finance_report(*, nd_finance_report_status(*), nd_finance_report_item(*, nd_finance_income_type(*), nd_finance_expense_type(*)))
            `);

        if (siteIds && siteIds.length > 0) query = query.in("id", siteIds);
        if (siteId) query = query.eq("id", siteId);

        const { data, error } = await query;
        if (error) {
            console.error(error);
            throw error;
        };

        return data;
    },

    getFinanceIdByMonthAndYear: async (month: string, year: string, siteId: number) => {
        const { data, error } = await supabase
            .from("nd_finance_report")
            .select("*")
            .eq("month", month)
            .eq("year", year)
            .eq("site_id", siteId)
            .maybeSingle();
        if (error) {
            console.error(error);
            throw error;
        };
        return data;
    },

    getPosTransactionItemByTransactionId: async (transactionId: string) => {
        const { data, error } = await supabase
            .from("nd_pos_transaction_item")
            .select("*")
            .eq("transaction_id", transactionId);
        if (error) {
            console.error(error);
            throw error;
        };
        const mergedData = [];
        for (const item of data) {
            const { data: inventoryData, error: inventoryError } = await supabase
                .from("nd_inventory")
                .select(`*, nd_inventory_attachment(*)`)
                .eq("id", item?.item_id);
            if (inventoryError) {
                console.error(inventoryError);
                throw inventoryError;
            };
            mergedData.push({
                ...item,
                inventory: inventoryData
            });
        }
        return mergedData;
    },

    getMemberProfileById: async (memberId: number) => {
        const { data, error } = await supabase
            .from("nd_member_profile")
            .select("*")
            .eq("id", memberId)
            .maybeSingle();
        if (error) {
            console.error(error);
            throw error;
        };
        return data;
    },

    getInventoryById: async (inventoryId: number) => {
        const { data, error } = await supabase
            .from("nd_inventory")
            .select(`*, nd_inventory_attachment(*)`)
            .eq("id", inventoryId)
            .maybeSingle();
        if (error) {
            console.error(error);
            throw error;
        };
        return data;
    },

};
