import React from "react";
import {
    Document,
    Page,
    StyleSheet,
    pdf,
} from "@react-pdf/renderer";
import { PDFFooter, PDFAppendixTitlePage } from "../component/pdf-component";
import { generateFinalPdfFromFiles, AttachmentFileSource } from "../component/pdf-attachment-handler";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: "Helvetica",
        position: "relative",
    },
});

type AppendixBlobProps = {
    appendixNumber: string;
    title: string;
    attachments: { 
        file: File;
        name: string;
        description: string;
    }[];
};

export default async function AppendixBlob({
    appendixNumber,
    title,
    attachments,
}: AppendixBlobProps): Promise<File> {
    // Define the appendix title page
    const appendixDoc = (
        <Document>
            <Page size="A4" style={styles.page}>
                <PDFAppendixTitlePage appendixNumber={appendixNumber} title={title} />
                <PDFFooter />
            </Page>
        </Document>
    );

    // Create a blob from the appendix title page
    const reportBlob = await pdf(appendixDoc).toBlob();

    // Process attachments as sources for generateFinalPdfFromFiles
    const sources: AttachmentFileSource[] = attachments.map((attachment) => ({
        attachment_files: [attachment.file], // Pass the File object directly
        standard_code: title, // Use title as a placeholder for standard_code
        description: attachment.description,
    }));

    // Generate the final PDF by merging the appendix title page with attachment pages
    const finalPdfBlob = await generateFinalPdfFromFiles(reportBlob, sources);

    // Generate filename based on appendix title
    const fileName = `appendix-${title.replace(/\s+/g, "-").toLowerCase()}.pdf`;

    // Convert blob to File object with metadata
    return new File([finalPdfBlob], fileName, {
        type: "application/pdf",
        lastModified: Date.now(),
    });
}