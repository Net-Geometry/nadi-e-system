import StatsCard from "../../dashboard/StatCard";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Site } from "@/types/site"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react"
import { Eye } from "lucide-react";

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
    const [sites, setSites] = useState<Site[]>(tpsSites);
    const [searchInput, setSearchInput] = useState("");
    console.log("sites state tp admin dashboard", sites)

    function handleSelectedSite(siteId: number) {
        setSelecTedSite(sites.find(site => site.id === Number(siteId)));
    }

    function handleSearch(searchInput: string) {

        let sitesTofiltered = tpsSites; 

        sitesTofiltered = sitesTofiltered.filter((site) => site.nd_site_profile.sitename.includes(searchInput));

        setSites(sitesTofiltered);
    }

    useEffect(() => {
        handleSearch(searchInput)
    }, [searchInput])

    // PCS in this site (total pc, in use, available)


    // Overview data 
    const siteOverView = [
        {
            title: "Total Sites",
            value: String(sites?.length),
            description: "",
            // iconTextColor: "text-green-500",
        },
        {
            title: "Total Pcs",
            value: "3",
            description: "",
            // iconTextColor: "text-green-500",
        },
        {
            title: "PCs In Use",
            value: "2",
            description: "",
            customValueColorClass: "text-blue-500"
            // iconTextColor: "text-green-500",
        },
        {
            title: "Pcs available",
            value: "1",
            description: "",
            customValueColorClass: "text-green-500"
            // iconTextColor: "text-green-500",
        },
    ]

    // Table data
    const headTable = [
        "Site Name",
        "Location",
        "Total PCs",
        "In Use",
        "available",
        "Status",
        "Action"
    ];

    const bodyTableData = sites.map((site) => {
        return {
            id: site.id,
            siteName: site?.nd_site_profile?.sitename,
            location: site?.nd_site_profile?.state_id,
            totalPcs: "8",
            inUse: "3",
            available: "5",
            status: "1 in Maintenance",
            action: "View"
        }
    })


    // trigger selected site to open booking && site selected

    return (
        <>
            <header className="flex flex-col justify-start">
                <h1 className="text-2xl font-bold">TP Admin Dashboard</h1>
                <p className="text-gray-600">Manage TP sites and PC bookings</p>
            </header>
            <div className="p-6 bg-white rounded-md border border-gray-200 mt-6">
                <h1 className="text-2xl font-semibold mb-3">Overview</h1>
                <div className="flex gap-3 items-center">
                    {siteOverView.map((site) => (
                        <StatsCard
                            className="flex-grow border border-gray-200"
                            title={site.title}
                            value={site.value}
                            customValueColorClass={site?.customValueColorClass}
                        />
                    ))}
                </div>
            </div>
            <div className="flex justify-between items-center mt-6">
                <Input 
                    className="w-[30%]" 
                    type="search" 
                    placeholder="Search Site..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)} 
                />
            </div>
            <div className="rounded-md">
                <Table className="w-full table-auto border-collapse text-sm mt-6 bg-white rounded-md">
                    <TableHeader>
                        <TableRow>
                            {
                                headTable.map((head) => (
                                    <TableHead key={head}>{head}</TableHead>
                                ))
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            bodyTableData.map((bookingItem, index) => (
                                <TableRow className="hover:bg-gray-200">
                                    <TableCell className="font-semibold">{bookingItem.siteName}</TableCell>
                                    <TableCell>{bookingItem.location}</TableCell>
                                    <TableCell>{bookingItem.totalPcs}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-blue-100 border hover:bg-blue-200 border-blue-600 text-blue-500">{bookingItem.inUse}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-100 border hover:bg-green-200 border-green-600 text-green-500">{bookingItem.available}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-amber-100 hover:bg-amber-200 border border-amber-600 text-amber-500">{bookingItem.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleSelectedSite(bookingItem.id)} className="flex items-center gap-1">
                                            <Eye />
                                            {bookingItem.action}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        </>
    )
}