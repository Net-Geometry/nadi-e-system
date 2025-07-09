import Audit from "../template/SiteManagement/Audit";
import Salary from "../template/Salary&HRManagement/Salary";
import PerformanceIncentive from "../template/Salary&HRManagement/PerformanceIncentive";
import ManPower from "../template/Salary&HRManagement/ManpowerManagement";
import LocalAuthority from "../template/SiteManagement/LocalAuthority";
import Insurance from "../template/SiteManagement/SiteInsurance";
import Agreement from "../template/SiteManagement/SiteAgreement";
import Utilities from "../template/SiteManagement/Utilities";
import AwarenessPromotion from "../template/SiteManagement/Awareness&Promotion";
import CMS from "../template/NADIeSystem/CMS";
import PortalWebService from "../template/NADIeSystem/Portal&WebService";
import ManageInternetService from "../template/InternetAccess/ManageInternetService";
import NMS from "../template/InternetAccess/NMS";
import Monitoring from "../template/InternetAccess/Monitoring&Reporting";
import Upscaling from "../template/Training/Upscaling";
import Refresh from "../template/Training/Refresh";
import Maintenance from "../template/ComprehensiveMaintenance/Maintenance";
import SmartService from "../template/SmartServices/SmartService";

export type ReportData = {
    claimType: string;
    quater: string;
    startDate: string;
    endDate: string;
    tpFilter: string;
    phaseFilter: number;
    duspFilter: string;
    dusplogo: string;
    nadiFilter: number[];
    header: boolean;
};

export const generateReportByItemId = async (itemId: number, reportData: ReportData): Promise<File | null> => {
    try {
        let generatedFile: File | null = null;

        switch (itemId) {
            case 1:
                generatedFile = await Salary(reportData);
                break;
            case 2:
                generatedFile = await PerformanceIncentive(reportData);
                break;
            case 3:
                generatedFile = await ManPower(reportData);
                break;
            case 4:
                generatedFile = await LocalAuthority(reportData);
                break;
            case 5:
                generatedFile = await Insurance(reportData);
                break;
            case 6:
                generatedFile = await Audit(reportData);
                break;
            case 7:
                generatedFile = await Agreement(reportData);
                break;
            case 9:
                generatedFile = await Utilities(reportData);
                break;
            case 11:
                generatedFile = await AwarenessPromotion(reportData);
                break;
            case 13:
                generatedFile = await CMS(reportData);
                break;
            case 14:
                generatedFile = await PortalWebService(reportData);
                break;
            case 15:
                generatedFile = await ManageInternetService(reportData);
                break;
            case 16:
                generatedFile = await NMS(reportData);
                break;
            case 17:
                generatedFile = await Monitoring(reportData);
                break;
            case 18:
                generatedFile = await Upscaling(reportData);
                break;
            case 19:
                generatedFile = await Refresh(reportData);
                break;
            case 20:
                generatedFile = await Maintenance(reportData);
                break;
            case 24:
                generatedFile = await SmartService(reportData);
                break;
            default:
                console.warn(`No report generator found for itemId: ${itemId}`);
                return null;
        }

        return generatedFile;
    } catch (error) {
        console.error(`Error generating report for item ${itemId}:`, error);
        return null;
    }
};

// Optional: Create a mapping object for easier maintenance
export const REPORT_GENERATORS = {
    1: Salary,
    2: PerformanceIncentive,
    3: ManPower,
    4: LocalAuthority,
    5: Insurance,
    6: Audit,
    7: Agreement,
    9: Utilities,
    11: AwarenessPromotion,
    13: CMS,
    14: PortalWebService,
    15: ManageInternetService,
    16: NMS,
    17: Monitoring,
    18: Upscaling,
    19: Refresh,
    20: Maintenance,
    24: SmartService,
} as const;

// Alternative implementation using the mapping object
export const generateReportByItemIdAlternative = async (itemId: number, reportData: ReportData): Promise<File | null> => {
    try {
        const generator = REPORT_GENERATORS[itemId as keyof typeof REPORT_GENERATORS];
        
        if (!generator) {
            console.warn(`No report generator found for itemId: ${itemId}`);
            return null;
        }

        return await generator(reportData);
    } catch (error) {
        console.error(`Error generating report for item ${itemId}:`, error);
        return null;
    }
};