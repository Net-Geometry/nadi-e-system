import React from "react";
import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// PDF styles for the components
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  logo: { 
    width: 80, 
    height: 60 
  },
  logo2:{
    width: 70, 
    height: 52.5, // Maintaining the aspect ratio (70 / 80 * 60 = 52.5)
    marginLeft: "auto", 
    marginRight: 0,
  },
  titleSection: { 
    textAlign: "center", 
    flex: 1 
  },
  title: { 
    fontSize: 14, 
    fontWeight: "bold", 
    textTransform: "uppercase" 
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
  },
  footerLine: {
    height: 1,
    backgroundColor: "#aaa",
    opacity: 0.3,
    marginBottom: 10,
  },
  footerText: { 
    fontSize: 9, 
    color: "#666" 
  },  
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  cellLabel: {
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "bold",
    padding: 6,
    borderRightWidth: 1,
    borderColor: "#000",
    width: "25%",
  },
  cellValue: {
    padding: 6,
    borderRightWidth: 1,
    borderColor: "#000",
    width: "25%",
  },  
  appendixTitlePage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    position: "relative",
  },  appendixContent: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    textAlign: "center",
  },  appendixPhaseInfo: {
    position: "absolute",
    top: 60, /* Positioned lower on the page */
    right: 0,
    zIndex: 100,
  },
  appendixNumber: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
  },  appendixTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
  },  phaseQuarterInfo: {
    textAlign: "right",
    fontSize: 8,
    marginLeft: "auto", /* Push to the right side */
    marginTop: 15, /* Position below other elements instead of at the top */
    zIndex: 100,
  },
});

/**
 * The PDF header component with MCMC and DUSP logos
 */
export const PDFHeader = ({ 
  mcmcLogo, 
  duspLogo 
}: { 
  mcmcLogo: string, 
  duspLogo: string 
}) => (
  <View style={styles.header}>
    <Image src={mcmcLogo} style={styles.logo} />
    <View style={styles.titleSection}>
      <Text style={styles.title}>THE NATIONAL INFORMATION</Text>
      <Text style={styles.title}>DISSEMINATION CENTRE (NADI)</Text>
    </View>
    <Image src={duspLogo} style={styles.logo2} />
  </View>
);

/**
 * The PDF meta section component for report information
 */
export const PDFMetaSection = ({
  reportTitle,
  phaseLabel,
  claimType = null,
  quater = null,
  startDate = null,
  endDate = null,
}: {
  reportTitle: string;
  phaseLabel?: string;
  claimType?: string | null;
  quater?: string | number | null;
  startDate?: string | null;
  endDate?: string | null;
}) => {  
  // Create styles for the meta section table
  const metaStyles = StyleSheet.create({
    container: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#000",
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
    },
    firstRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
    },    
    labelCell: {
      backgroundColor: "#000",
      color: "#fff",
      fontWeight: "bold",
      padding: 6,
      width: "20%",
      borderRightWidth: 1,
      borderRightColor: "#000",
    },    
    valueCell: {
      padding: 6,
      width: "80%",
      borderRightWidth: 0,
    },
    phaseCell: {
      padding: 6,
      width: "30%", 
      borderRightWidth: 1,
      borderRightColor: "#000",
    },
    periodLabelCell: {
      backgroundColor: "#000",
      color: "#fff", 
      fontWeight: "bold",
      padding: 6,
      width: "25%",
      borderRightWidth: 1,
      borderRightColor: "#000",
    },    
    periodValueCell: {
      padding: 6,
      width: "25%",
      borderRightWidth: 0, // Remove right border on the last cell
    }
  });
    // Create a style for the last row that doesn't have a bottom border
  const lastRowStyle = {
    ...metaStyles.row,
    borderBottomWidth: 0, // Remove bottom border from last row to avoid double borders
  };
  
  // Determine periodType based on claimType if not directly provided
   const periodType = claimType ? 
        (claimType.toLowerCase() === "monthly" ? "MONTH / YEAR" :
         claimType.toLowerCase() === "quarterly" ? "QUARTER / YEAR" :
         claimType.toLowerCase() === "yearly" ? "YEAR" :
         "All Time") : "All Time";

  
  // Format the period value based on periodType and available data
  let formattedPeriodValue = "-";
  
  // Extract month and year from startDate and endDate if provided
  const month = startDate ? new Date(startDate).toLocaleString('default', { month: 'short' }) : null;
  const year = endDate ? new Date(endDate).getFullYear().toString() : null;
  
  if (periodType === "MONTH / YEAR" && month && year) {
    formattedPeriodValue = `${month} ${year}`;
  } else if (periodType === "QUARTER / YEAR") {
    if (quater && year) {
      formattedPeriodValue = `${quater} ${year}`;
    }
  } else if (periodType === "YEAR" && year) {
    formattedPeriodValue = `${year}`;
  }
  
  return (
    <View style={metaStyles.container}>
      <View style={metaStyles.firstRow}>
        <Text style={metaStyles.labelCell}>REPORT</Text>
        <Text style={metaStyles.valueCell}>{reportTitle}</Text>
      </View>      
      <View style={lastRowStyle}>
        <Text style={metaStyles.labelCell}>PHASE</Text>
        <Text style={metaStyles.phaseCell}>{phaseLabel || "-"}</Text>
        <Text style={metaStyles.periodLabelCell}>{periodType}</Text>
        <Text style={metaStyles.periodValueCell}>{formattedPeriodValue}</Text>
      </View>
    </View>
  );
};

/**
 * The PDF Section Title component
 */
export const PDFSectionTitle = ({ 
  title 
}: { 
  title: string 
}) => {
  const sectionStyles = StyleSheet.create({
    sectionTitle: {
      backgroundColor: "#000",
      color: "#fff",
      padding: 8,
      fontSize: 10,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
      textTransform: "uppercase",
    }
  });

  return <Text style={sectionStyles.sectionTitle}>{title}</Text>;
};

/**
 * The PDF Info Table component for displaying structured information tables with title header
 */
export const PDFInfoTable = ({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: string }[];
}) => {
  const infoTableStyles = StyleSheet.create({
    container: {
      width: "85%", // Reduced width to add margin on both sides
      borderWidth: 1,
      borderColor: "#000",
      marginBottom: 20,
      marginHorizontal: "auto", // Center the table
    },
    titleContainer: {
      backgroundColor: "#000",
      padding: 6, // Slightly reduced padding
      width: "100%",
      textAlign: "center",
    },
    title: {
      color: "#fff",
      fontSize: 9, // Reduced font size
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    row: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#000",
    },
    labelCell: {
      backgroundColor: "#fff",
      padding: 5, // Slightly reduced padding
      width: "30%",
      borderRightWidth: 1,
      borderRightColor: "#000",
      fontSize: 8, // Reduced font size
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    valueCell: {
      padding: 5, // Slightly reduced padding
      width: "70%",
      fontSize: 8, // Reduced font size
    }
  });

  return (
    <View style={infoTableStyles.container}>
      <View style={infoTableStyles.titleContainer}>
        <Text style={infoTableStyles.title}>{title}</Text>
      </View>
      {data.map((item, index) => (
        <View 
          key={index} 
          style={[
            infoTableStyles.row,
            // Remove bottom border from last row
            index === data.length - 1 && { borderBottomWidth: 0 }
          ]}
        >
          <Text style={infoTableStyles.labelCell}>{item.label}</Text>
          <Text style={infoTableStyles.valueCell}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

/**
 * The PDF Table component for standardized tables
 */
export const PDFTable = <T extends Record<string, any>>({
  data,
  columns,
}: {
  data: T[];
  columns: {
    key: keyof T | ((row: T, index: number) => React.ReactNode);
    header: string;
    width?: number | string;
    render?: (value: any, row: T, index: number) => React.ReactNode;
  }[];
}) => {
  // Process columns to handle dynamic and fixed width columns
  const fixedWidthColumns = columns.filter(col => col.width);
  const dynamicColumns = columns.filter(col => !col.width);

  // Calculate total fixed width percentage  
  const totalFixedWidth = fixedWidthColumns.reduce((total, col) => {
    const width = typeof col.width === 'string' 
      ? parseFloat(col.width.replace('%', '')) 
      : (typeof col.width === 'number' ? col.width : 0);
    return total + width;
  }, 0);

  // Calculate remaining percentage for dynamic columns
  let remainingWidth = Math.max(0, 100 - totalFixedWidth);
  let dynamicColumnWidth = dynamicColumns.length > 0 
    ? remainingWidth / dynamicColumns.length 
    : 0;

  // If no columns have width, distribute equally
  if (fixedWidthColumns.length === 0) {
    dynamicColumnWidth = 100 / columns.length;
    remainingWidth = 100;
  }

  const tableStyles = StyleSheet.create({
    table: { 
      width: "100%", 
      borderWidth: 1,
      borderColor: "#000",
      marginTop: 10
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#000",
      color: "#fff",
      fontWeight: "bold",
    },    
    tableRow: { 
      flexDirection: "row", 
      borderBottomWidth: 1,
      borderBottomColor: "#000"
    },
    th: { 
      padding: 6, 
      fontSize: 8,
      fontWeight: "bold",
      textTransform: "uppercase",
      textAlign: "center",
      color: "#fff",
    },      td: { 
      padding: 6,
      fontSize: 8,
    },
    cell: {
      borderRightWidth: 1,
      borderRightStyle: "solid",
      borderRightColor: "#000",
    },
    numberCell: {
      width: "5%",
      textAlign: "center",
      paddingLeft: 4,
      paddingRight: 4,
    }
  });  

  // Create styles for each column once - this ensures header and data cells use exactly the same width
  const columnStyles = columns.map((column, index) => {
    // Base style with border
    const style: any = { 
      borderRightWidth: 1,
      borderRightColor: "#000" 
    };
    // Set width based on column specifications
    if (column.width) {
      style.width = column.width;
    } else {
      style.width = `${dynamicColumnWidth}%`;
    }
    // Special handling for number column
    if (index === 0) {
      style.textAlign = "center";
      style.paddingLeft = 4;
      style.paddingRight = 4;
    }
    // Remove right border from the last column to prevent double borders with table border
    if (index === columns.length - 1) {
      style.borderRightWidth = 0;
    }
    return style;
  });  

  return (
    <View style={tableStyles.table}>
      <View style={tableStyles.tableHeader}>
        {columns.map((column, i) => (          
          <Text 
            key={i} 
            style={[
              tableStyles.th,
              columnStyles[i]
            ]}
          >
            {column.header}
          </Text>
        ))}
      </View>
      {data.map((row, rowIndex) => (
        <View 
          key={rowIndex} 
          style={[
            tableStyles.tableRow,
            // Add white background to even rows and remove bottom border from last row
            {
              ...(rowIndex % 2 === 1 && { backgroundColor: "#f9f9f9" }),
              ...(rowIndex === data.length - 1 && { borderBottomWidth: 0 })
            }
          ]}
        >
          {columns.map((column, colIndex) => {
            const cellValue = typeof column.key === 'function' 
              ? column.key(row, rowIndex)
              : row[column.key as keyof T];
            const displayValue = column.render 
              ? column.render(cellValue, row, rowIndex) 
              : cellValue;
            return (
              <Text 
                key={colIndex} 
                style={[
                  tableStyles.td,
                  columnStyles[colIndex]
                ]}
              >
                {displayValue}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
};

/**
 * Component for displaying Phase and Quarter information aligned with the totalBox component
 */
export const PDFPhaseQuarterInfo = ({
    phaseLabel,
    claimType = null,
    quater = null,
    startDate = null,
    endDate = null,
}: {
    phaseLabel?: string;
    claimType?: string | null;
    quater?: string | number | null;
    startDate?: string | null;
    endDate?: string | null;
}) => {
    // Determine periodType based on claimType
    const periodType = claimType ? 
        (claimType.toLowerCase() === "monthly" ? "MONTH / YEAR" :
         claimType.toLowerCase() === "quarterly" ? "QUARTER / YEAR" :
         claimType.toLowerCase() === "yearly" ? "YEAR" :
         "All Time") : "All Time";
    // Format the period value based on periodType
    let periodValue = '-';
    
    // Extract month and year from startDate and endDate
    const month = startDate ? new Date(startDate).toLocaleString('default', { month: 'short' }) : null;
    const year = endDate ? new Date(endDate).getFullYear().toString() : null;
    
    if (periodType === "MONTH / YEAR" && month && year) {
        periodValue = `${month} ${year}`;
    } else if (periodType === "QUARTER / YEAR" && quater && year) {
        periodValue = `${quater} ${year}`;
    } else if (periodType === "YEAR" && year) {
        periodValue = `${year}`;
    }
    
    return (
        <View style={{
            ...styles.phaseQuarterInfo, 
            width: 170, 
        }}>
            <Text style={{ fontSize: 8, textTransform: "uppercase" }}>
                <Text style={{ fontWeight: "bold" }}>PHASE: </Text>
                {phaseLabel || '-'}
            </Text>
            <Text style={{ fontSize: 8, textTransform: "uppercase" }}>
                <Text style={{ fontWeight: "bold" }}>{periodType}: </Text>
                {periodValue}
            </Text>
        </View>
    );
};

/**
 * The PDF Appendix Title Page component
 */
export const PDFAppendixTitlePage = ({ 
  appendixNumber,
  title,
}: { 
  appendixNumber: string;
  title: string;
  phaseLabel?: string;
  periodType?: string;
  periodValue?: string;
  showPhaseInfo?: boolean;
}) => {
  return (
    <View style={{flex: 1, position: "relative"}}>
      <View style={styles.appendixContent}>
        <Text style={styles.appendixNumber}>{appendixNumber}</Text>
        <Text style={styles.appendixTitle}>{title}</Text>
      </View>
    </View>
  );
};

/**
 * The PDF footer component
 */
export const PDFFooter = ({ 
  customText 
}: { 
  customText?: string 
}) => {
  // Get current date and time
  const now = new Date();
  const formattedDateTime = now.toLocaleString('en-MY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  return (    <View style={styles.footer}>
      <View style={styles.footerLine} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.footerText}>
          {"This document is system-generated from NADI e-System."}
        </Text>
        <Text style={styles.footerText}>
          Generated on: {formattedDateTime}
        </Text>
      </View>
    </View>
  );
};
