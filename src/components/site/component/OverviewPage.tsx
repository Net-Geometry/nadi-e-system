

const capitalize = (str?: string) =>
  str ? str.toUpperCase() : "";

const OverviewPage = ({
  site,
  organization,
}: {
  site: any;
  organization?: any;
}) => {


  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 mt-4 gap-6">
        {/* LEFT: Site Organization */}
        <div className="flex flex-col items-center flex-1 border rounded-lg p-4 bg-white shadow-sm">
          <div className="text-xs text-muted-foreground mb-2">
            {site?.dusp_tp_id?.type ? capitalize(site.dusp_tp_id.type) : "TP"}
          </div>
          {site?.dusp_tp_id?.logo_url ? (
            <img
              src={site.dusp_tp_id.logo_url}
              alt={site.dusp_tp_id.name || "Logo"}
              className="h-12 w-12 object-contain mb-2"
            />
          ) : (
            <div className="h-12 w-12 flex items-center justify-center text-sm text-muted-foreground mb-2">
              N/A
            </div>
          )}
          <div className="font-semibold">
            {site?.dusp_tp_id?.name || "N/A"}
          </div>
        </div>

        {/* RIGHT: Parent Organization */}
        <div className="flex flex-col items-center flex-1 border rounded-lg p-4 bg-white shadow-sm">
          <div className="text-xs text-muted-foreground mb-2">
            {organization?.parent?.type ? capitalize(organization.parent.type) : "DUSP"}
          </div>
          {organization?.parent?.logo_url ? (
            <img
              src={organization.parent.logo_url}
              alt={organization.parent.name || "Logo"}
              className="h-12 w-12 object-contain mb-2"
            />
          ) : (
            <div className="h-12 w-12 flex items-center justify-center text-sm text-muted-foreground mb-2">
              N/A
            </div>
          )}
          <div className="font-semibold">
            {organization?.parent?.name || "N/A"}
          </div>
        </div>
      </div>


      {/* Site Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div>
          <div className="text-sm text-muted-foreground">Site Name</div>
          <div className="">{site?.sitename ?? "N/A"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Full Name</div>
          <div className="">{site?.fullname ?? "N/A"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Phase</div>
          <div className="">{site?.phase_id?.name ?? "N/A"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="">{site?.active_status?.eng ?? "N/A"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Operate Date</div>
          <div className="">
            {site?.operate_date
              ? new Date(site.operate_date).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </div>

      {/* You can add more details/components below if needed */}
    </div>
  );
};

export default OverviewPage;