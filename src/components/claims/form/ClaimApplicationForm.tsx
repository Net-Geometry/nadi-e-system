import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import useClaimCategorySimple from "../hook/use-claim-categoy-simple";
import { useSiteByPhase } from "../hook/use-claim-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type CategoryData = {
    id: number;
    name: string;
    item_ids: {
        id: number;
        name: string;
        need_support_doc: boolean;
        need_summary_report: boolean;
        need_appendix: boolean;
        summary_report_file: File | null;
        site_ids: number[];
    }[];
};

type ClaimData = {
    phase_id: number;
    claim_type: string;
    category_ids: CategoryData[];
};

type ClaimApplicationFormProps = ClaimData & {
    updateFields: (fields: Partial<ClaimData>) => void;
};

export function ClaimApplicationForm({
    phase_id,
    claim_type,
    category_ids,
    updateFields,
}: ClaimApplicationFormProps) {
    const { categories } = useClaimCategorySimple();
    const { phases, fetchSitesByPhase } = useSiteByPhase();
    const [sites, setSites] = useState<{ id: number; name: string; refid_mcmc: string; refid_tp: string }[]>([]);
    const [selectedItem, setSelectedItem] = useState<{ categoryId: number; itemId: number } | null>(null);
    const [tempSelectedSites, setTempSelectedSites] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(""); // State for search input

    // Filter sites based on the search term
    const filteredSites = sites.filter(
        (site) =>
            site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.refid_mcmc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.refid_tp?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFetchSites = async (phaseId: number) => {
        const fetchedSites = await fetchSitesByPhase(phaseId);
        const mappedSites = fetchedSites.map((site: { id: number; fullname: string; refid_mcmc: string; refid_tp: string }) => ({
            id: site.id,
            name: site.fullname,
            refid_mcmc: site.refid_mcmc || "N/A",
            refid_tp: site.refid_tp || "N/A",
        }));
        setSites(mappedSites);

        // Auto-select all sites when they are loaded
        setTempSelectedSites(mappedSites.map((site) => site.id));
    };

    useEffect(() => {
        if (phase_id) {
            handleFetchSites(phase_id);
        }
    }, [phase_id]);

    useEffect(() => {
        if (selectedItem) {
            const { categoryId, itemId } = selectedItem;
            const existing = category_ids.find((cat) => cat.id === categoryId)
                ?.item_ids.find((item) => item.id === itemId)?.site_ids || [];
            setTempSelectedSites(existing.length > 0 ? existing : sites.map((site) => site.id)); // Auto-select all if no existing selection
        }
    }, [selectedItem, sites]);

    const handleSiteSelection = (siteId: number) => {
        setTempSelectedSites((prev) =>
            prev.includes(siteId)
                ? prev.filter((id) => id !== siteId)
                : [...prev, siteId]
        );
    };

    const toggleAllSites = (checked: boolean) => {
        setTempSelectedSites(checked ? sites.map((site) => site.id) : []);
    };

    const confirmSiteSelection = () => {
        if (selectedItem) {
            const { categoryId, itemId } = selectedItem;
            updateFields({
                category_ids: category_ids
                    .map((category) =>
                        category.id === categoryId
                            ? {
                                ...category,
                                item_ids: category.item_ids.map((item) =>
                                    item.id === itemId
                                        ? {
                                            ...item,
                                            site_ids: tempSelectedSites,
                                            summary_report_file: null,
                                        }
                                        : item
                                ),
                            }
                            : category
                    )
                    .sort((a, b) => a.id - b.id)
                    .map((cat) => ({
                        ...cat,
                        item_ids: [...cat.item_ids].sort((a, b) => a.id - b.id),
                    })),
            });

            setSelectedItem(null);
        }
    };

    return (
        <div>
            <header className="mb-4">Phase, Items, & Sites</header>
            {/* <pre>{JSON.stringify(category_ids, null, 2)}</pre> */}

            {/* Phase Selection */}
            <div className="space-y-2 mb-4">
                <Label className="flex items-center">Phase</Label>
                <Select
                    value={phase_id?.toString() ?? ""}
                    onValueChange={(value) => {
                        updateFields({ phase_id: Number(value), category_ids: [] }); // Reset category_ids
                        handleFetchSites(Number(value));
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Phase" />
                    </SelectTrigger>
                    <SelectContent>
                        {phases?.map((phase) => (
                            <SelectItem key={phase.id} value={String(phase.id)}>
                                {phase.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            {phase_id && (
                <>
                    <div className="mb-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="scale-110 cursor-pointer"
                                checked={categories.every((category) =>
                                    category_ids.some((cat) => cat.id === category.id)
                                )}
                                onChange={(e) => {
                                    const checked = e.target.checked;

                                    const newCategoryIds = checked
                                        ? categories.map((category) => ({
                                            id: category.id,
                                            name: category.name,
                                            item_ids: category.children.map((item) => ({
                                                id: item.id,
                                                name: item.name,
                                                need_support_doc: item.need_support_doc,
                                                need_summary_report: item.need_summary_report,
                                                need_appendix: item.need_appendix,
                                                summary_report_file: null, // Reset file on selection
                                                site_ids: sites.map((site) => site.id), // Auto-select all sites
                                            })),
                                        }))
                                        : [];

                                    updateFields({
                                        category_ids: newCategoryIds,
                                    });
                                }}
                            />
                            <span>Select All Categories</span>
                        </label>
                    </div>
                    <div>
                        <Table className="border border-gray-300 w-full text-sm">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="px-4 py-2 border">Category</TableHead>
                                    <TableHead className="px-4 py-2 border">Items</TableHead>
                                    <TableHead className="px-4 py-2 border text-center">Select Items</TableHead>
                                    <TableHead className="px-4 py-2 border text-center">Select Site</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {categories.map((category) => (
                                    <React.Fragment key={category.id}>
                                        {/* Add "Select All Items" checkbox for the category */}
                                        <TableRow>
                                            <TableCell colSpan={4} className="px-4 py-2 border">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        className="scale-110 cursor-pointer"
                                                        checked={category.children.every((item) =>
                                                            category_ids.some(
                                                                (cat) =>
                                                                    cat.id === category.id &&
                                                                    cat.item_ids.some((i) => i.id === item.id)
                                                            )
                                                        )}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;

                                                            const newCategoryIds = checked
                                                                ? (() => {
                                                                    const existingCategory = category_ids.find((cat) => cat.id === category.id);
                                                                    if (existingCategory) {
                                                                        // Add only items that are not already present
                                                                        const newItems = category.children.filter(
                                                                            (item) =>
                                                                                !existingCategory.item_ids.some((existingItem) => existingItem.id === item.id)
                                                                        ).map((item) => ({
                                                                            id: item.id,
                                                                            name: item.name,
                                                                            need_support_doc: item.need_support_doc,
                                                                            need_summary_report: item.need_summary_report,
                                                                            need_appendix: item.need_appendix,
                                                                            summary_report_file: null, // Reset file on selection
                                                                            site_ids: sites.map((site) => site.id), // Auto-select all sites
                                                                        }));

                                                                        return category_ids.map((cat) =>
                                                                            cat.id === category.id
                                                                                ? {
                                                                                    ...cat,
                                                                                    item_ids: [...cat.item_ids, ...newItems],
                                                                                }
                                                                                : cat
                                                                        );
                                                                    } else {
                                                                        // Add the category with all items
                                                                        return [
                                                                            ...category_ids,
                                                                            {
                                                                                id: category.id,
                                                                                name: category.name,
                                                                                item_ids: category.children.map((item) => ({
                                                                                    id: item.id,
                                                                                    name: item.name,
                                                                                    need_support_doc: item.need_support_doc,
                                                                                    need_summary_report: item.need_summary_report,
                                                                                    need_appendix: item.need_appendix,
                                                                                    summary_report_file: null, // Reset file on selection
                                                                                    site_ids: sites.map((site) => site.id), // Auto-select all sites
                                                                                })),
                                                                            },
                                                                        ];
                                                                    }
                                                                })()
                                                                : category_ids
                                                                    .map((cat) =>
                                                                        cat.id === category.id
                                                                            ? {
                                                                                ...cat,
                                                                                item_ids: [],
                                                                            }
                                                                            : cat
                                                                    )
                                                                    .filter((cat) => cat.item_ids.length > 0);

                                                            updateFields({
                                                                category_ids: newCategoryIds
                                                                    .sort((a, b) => a.id - b.id)
                                                                    .map((cat) => ({
                                                                        ...cat,
                                                                        item_ids: [...cat.item_ids].sort((a, b) => a.id - b.id),
                                                                    })),
                                                            });
                                                        }}
                                                    />
                                                    <span>Select All Items in {category.name}</span>
                                                </label>
                                            </TableCell>
                                        </TableRow>

                                        {category.children.map((item, index) => (
                                            <TableRow key={item.id}>
                                                {index === 0 && (
                                                    <TableCell
                                                        className="px-4 py-2 border align-top"
                                                        rowSpan={category.children.length}
                                                    >
                                                        {category.id}, {category.name}
                                                    </TableCell>
                                                )}
                                                <TableCell className="px-4 py-2 border">
                                                    {item.id}, {item.name}
                                                </TableCell>
                                                <TableCell className="px-4 py-2 text-center border">
                                                    <input
                                                        type="checkbox"
                                                        className="scale-110 cursor-pointer"
                                                        checked={category_ids.some(
                                                            (cat) =>
                                                                cat.id === category.id &&
                                                                cat.item_ids.some((i) => i.id === item.id)
                                                        )}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;

                                                            const newCategoryIds = checked
                                                                ? (() => {
                                                                    const existingCategory = category_ids.find((cat) => cat.id === category.id);
                                                                    if (existingCategory) {
                                                                        return category_ids.map((cat) =>
                                                                            cat.id === category.id
                                                                                ? {
                                                                                    ...cat,
                                                                                    item_ids: [
                                                                                        ...cat.item_ids,
                                                                                        {
                                                                                            id: item.id,
                                                                                            name: item.name,
                                                                                            need_support_doc: item.need_support_doc,
                                                                                            need_summary_report: item.need_summary_report,
                                                                                            need_appendix: item.need_appendix,
                                                                                            summary_report_file: null,
                                                                                            site_ids: sites.map((site) => site.id),
                                                                                        },
                                                                                    ],
                                                                                }
                                                                                : cat
                                                                        );
                                                                    } else {
                                                                        return [
                                                                            ...category_ids,
                                                                            {
                                                                                id: category.id,
                                                                                name: category.name,
                                                                                item_ids: [
                                                                                    {
                                                                                        id: item.id,
                                                                                        name: item.name,
                                                                                        need_support_doc: item.need_support_doc,
                                                                                        need_summary_report: item.need_summary_report,
                                                                                        need_appendix: item.need_appendix,
                                                                                        summary_report_file: null,
                                                                                        site_ids: sites.map((site) => site.id),
                                                                                    },
                                                                                ],
                                                                            },
                                                                        ];
                                                                    }
                                                                })()
                                                                : category_ids
                                                                    .map((cat) =>
                                                                        cat.id === category.id
                                                                            ? {
                                                                                ...cat,
                                                                                item_ids: cat.item_ids.filter((i) => i.id !== item.id),
                                                                            }
                                                                            : cat
                                                                    )
                                                                    .filter((cat) => cat.item_ids.length > 0);

                                                            updateFields({
                                                                category_ids: newCategoryIds
                                                                    .sort((a, b) => a.id - b.id)
                                                                    .map((cat) => ({
                                                                        ...cat,
                                                                        item_ids: [...cat.item_ids].sort((a, b) => a.id - b.id),
                                                                    })),
                                                            });
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell className="px-4 py-2 text-center border">
                                                    {category_ids.some(
                                                        (cat) =>
                                                            cat.id === category.id &&
                                                            cat.item_ids.some((i) => i.id === item.id)
                                                    ) && (
                                                            <>
                                                                <button
                                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                                                    onClick={() =>
                                                                        setSelectedItem({ categoryId: category.id, itemId: item.id })
                                                                    }
                                                                >
                                                                    Select Site
                                                                </button>
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    {(() => {
                                                                        const matchItem = category_ids
                                                                            .flatMap((cat) => cat.item_ids)
                                                                            .find((i) => i.id === item.id);
                                                                        const count = matchItem?.site_ids?.length || 0;
                                                                        return `${count} site${count !== 1 ? "s" : ""} selected`;
                                                                    })()}
                                                                </div>
                                                            </>
                                                        )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}

            {/* Dialog for Site Selection */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Select Site</DialogTitle>
                        <DialogDescription>
                            Please select the site(s) for the selected item.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <Input
                            type="text"
                            placeholder="Search sites by name, refid MCMC, or refid TP"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <Search className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center space-x-2">
                            <input
                                className="scale-110 cursor-pointer"
                                type="checkbox"
                                checked={tempSelectedSites.length === sites.length}
                                onChange={(e) => toggleAllSites(e.target.checked)}
                            />
                            <span>Select All Sites</span>
                        </label>
                    </div>

                    {/* Filtered Sites */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {filteredSites.length > 0 ? (
                            filteredSites.map((site) => (
                                <div
                                    key={site.id}
                                    className="p-2 border border-gray-300 rounded flex items-center bg-white shadow-sm"
                                >
                                    <input
                                        className="mr-2 scale-110 cursor-pointer"
                                        type="checkbox"
                                        checked={tempSelectedSites.includes(site.id)}
                                        onChange={() => handleSiteSelection(site.id)}
                                    />
                                    <div>
                                        <p className="font-medium">{site.name}</p>
                                        <p className="text-xs text-gray-500">
                                            Ref ID MCMC: {site.refid_mcmc || "N/A"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Ref ID TP: {site.refid_tp || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 col-span-full">
                                No sites found matching your criteria.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setSelectedItem(null)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmSiteSelection}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}