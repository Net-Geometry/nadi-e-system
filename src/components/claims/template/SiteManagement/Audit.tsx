import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    pdf,
} from "@react-pdf/renderer";
import {
    PDFFooter,
    PDFTable,
    PDFSectionTitle,
    PDFAppendixTitlePage,
    PDFPhaseQuarterInfo,
    PDFMetaSection
} from "../component/pdf-component";
import useAuditData from "./hook/use-audit-data";
import usePhase from "@/hooks/use-phase";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: "Helvetica",
        position: "relative",
    },
    totalBox: {
        padding: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#000",
        borderStyle: "solid",
        textAlign: "center",
        fontSize: 12,
        width: 170, /* Fixed width to match PDFPhaseQuarterInfo */
    },
});

type AuditProps = {
    duspFilter?: string | number;
    phaseFilter?: string | number | null;
    tpFilter?: string | number;
    nadiFilter?: (string | number)[];
    startDate?: string | null;
    endDate?: string | null;
    claimType?: string | null; //monthly/quarter/yearly
    quater?: string | null; //optional, used for quarterly reports
};

// Convert to an async function that returns a File object
const Audit = async ({
    duspFilter = null,
    phaseFilter = null,
    nadiFilter = [],
    tpFilter = null,
    startDate = null,
    endDate = null,
    claimType = null,
    quater = null

}: AuditProps): Promise<File> => {
    // Fetch audit data based on filters
    const { audits } = useAuditData({
        startDate,
        endDate,
        duspFilter,
        phaseFilter,
        nadiFilter,
        tpFilter
    });

    // Fetch phase info if phaseFilter is provided
    const { phase } = usePhase(phaseFilter);
    const phaseLabel = phase?.name || "All Phases";

    // Define the PDF document
    const AuditDoc = (
        <Document>
            {/* Page 1: Audits */}
            <Page size="A4" style={styles.page}>
                <PDFSectionTitle title="2.3 AUDITS" />

                <PDFMetaSection
                    reportTitle="AUDIT REPORT"
                    phaseLabel={phaseLabel}
                    claimType={claimType}
                    quater={quater}
                    startDate={startDate}
                    endDate={endDate}

                />

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                    <View style={styles.totalBox}>
                        {/* total NADI sites with audits */}
                        <Text>Total NADI{"\n"}{audits.length}</Text>
                    </View>
                    <View style={{ alignSelf: "flex-end" }}>
                        <PDFPhaseQuarterInfo
                            phaseLabel={phaseLabel}
                            claimType={claimType}
                            quater={quater}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    </View>
                </View>

                {audits.length > 0 ? (
                    <PDFTable
                        data={audits}
                        columns={[
                            { key: (_, i) => `${i + 1}.`, header: "NO", width: "5%" },
                            { key: "standard_code", header: "SITE CODE" },
                            { key: "site_name", header: "NADI" },
                            { key: "state", header: "STATE" },
                        ]}
                    />
                ) : (
                    <Text>No audit data available.</Text>
                )}
                <PDFFooter />
            </Page>

            {/* Page 2: APPENDIX for AUDIT - Only show if there are audit attachments */}
            <Page size="A4" style={styles.page}>
                <PDFAppendixTitlePage
                    appendixNumber="APPENDIX"
                    title="SITE AUDIT"
                />
                <PDFFooter />
            </Page>
        </Document>
    );

    // Create a blob from the PDF document
    const blob = await pdf(AuditDoc).toBlob();    // Generate filename based on available filters
    const dateStr = new Date().toISOString().split('T')[0];
      // Build filename parts
    let filenameParts = ['audit-report'];
    
    // Add claim type if available
    if (claimType) {
        filenameParts.push(claimType);
    }
    
    // Add phase name if available
    if (phase?.name) {
        filenameParts.push(phase.name.replace(/\s+/g, '-'));
    }
    
    // Always add the current date
    filenameParts.push(dateStr);
    
    // Combine all parts with hyphens and add extension
    let fileName = `${filenameParts.join('-')}.pdf`;

    // Convert blob to File object with metadata
    return new File([blob], fileName, {
        type: 'application/pdf',
        lastModified: Date.now()
    });
}

export default Audit;