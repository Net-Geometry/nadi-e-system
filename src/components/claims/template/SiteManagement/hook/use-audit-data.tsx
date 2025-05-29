import React, { useEffect, useState } from 'react'

export interface AuditData{
    site_id: string;
    standard_code: string;
    site_name: string;
    refId: string;
    state: string;
    attachments_path: string[];
}


export const useAuditData = ({
    startDate = null,
    endDate = null,
    duspFilter = null,
    phaseFilter = null,
    nadiFilter = [],
    tpFilter = null,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{
        audits: AuditData[];

    }>({
        audits: [],
    });    
    
    useEffect(() => {
        // This hook is intended to fetch audit data based on the provided filters
        // You can implement your data fetching logic here
        // For example, you might use an API call to fetch the audit data

        console.log("Fetching audit data with filters:", { 
            startDate, 
            endDate, 
            duspFilter, 
            phaseFilter, 
            nadiFilter, 
            tpFilter 
        });
        
        setLoading(true);
        setData({
            audits: [
                {
                    site_id: "1",
                    standard_code: "SC001",
                    site_name: "Site A",
                    refId: "REF001",
                    state: "State A",
                    attachments_path: ["path/to/attachment1", "path/to/attachment2"]
                },
                {
                    site_id: "2",
                    standard_code: "SC002",
                    site_name: "Site B",
                    refId: "REF002",
                    state: "State B",
                    attachments_path: ["path/to/attachment3"]
                }
            ]
        });        setLoading(false);
        setError(null);
    }, []);


    return {...data, loading, error}
}

export default useAuditData;

