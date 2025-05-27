import React from "react";

interface LogTabProps {
  claimData: {
    logs: Array<{
      id: number;
      remark?: string | null;
      created_at?: string | null;
      status_id?: { id?: number; name?: string } | null;
      created_by?: { full_name?: string; email?: string } | null;
    }>;
  };
}

const LogTab: React.FC<LogTabProps> = ({ claimData }) => {
  const { logs } = claimData;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Claim Logs</h2>
      {/* <pre>{JSON.stringify(logs, null, 2)}</pre> */}

      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Remark</th>
              <th className="border border-gray-300 px-4 py-2">By</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log?.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 px-4 py-2">
                  {log?.created_at ? new Date(log.created_at).toLocaleString("en-GB") : "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">{log?.status_id?.name || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">{log?.remark || "No remark"}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {log?.created_by?.full_name
                    ? `${log.created_by.full_name} - ${log.created_by.email || "No email"}`
                    : "Unknown"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTab;