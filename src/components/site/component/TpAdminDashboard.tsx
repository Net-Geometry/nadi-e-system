import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Site } from "@/types/site"
import { Eye } from "lucide-react"
import { useState } from "react"

interface TpAdminDashboardProps {
    selectedSite: Site
    setSelecTedSite: React.Dispatch<React.SetStateAction<Site | any>>
    tpsSites: Site[] | any[]
}

export const TpAdminDashBoard = ({
    selectedSite,
    setSelecTedSite,
    tpsSites
}: TpAdminDashboardProps) => {
    console.log("tps sites from tp admin comp", tpsSites)
    // state management tp sites
    const [sites, _] = useState(tpsSites);
    console.log("sites state tp admin dashboard", sites)

    function handleSelectedSite(siteId: string) {
        setSelecTedSite(sites.find(site => site.id === siteId));
    }

    // PCS in this site (total pc, in use, available)



    // trigger selected site to open booking && site selected

    return (
        <>
            <header className="flex flex-col justify-start">
                <h1 className="text-2xl font-bold">TP Admin Dashboard</h1>
                <p className="text-gray-600">Manage TP sites and PC bookings</p>
            </header>
            <div className="flex justify-between items-center mt-6">
                <Input className="w-[30%]" type="search" placeholder="Search Site..."/>
                <Button>add new TP Site</Button>
            </div>
            <div className="grid grid-cols-3 gap-5 mt-4">
                {
                    sites?.map((site: Site) => (
                        // Get pcs by site

                        <div className="border rounded-sm shadow-sm" key={site.id}>
                            <div className="flex justify-between items-center px-5 py-4 bg-gray-200 rounded-t-sm">
                                <h1 className="text-xl font-bold">{site.nd_site_profile?.sitename}</h1>
                                <Badge>{site.nd_site_profile?.state_id}</Badge>
                            </div>
                            <div className="px-5 py-4">Soon: PC Information in this site</div>
                            <div className="px-5 py-4 flex justify-between items-center">
                                <Badge>Maintenance</Badge>
                                <Button onClick={() => handleSelectedSite(site.id)} className="flex items-center gap-1">
                                    <Eye />
                                    View
                                </Button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}