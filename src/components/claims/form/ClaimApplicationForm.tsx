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

type CategoryData = {
  id: number;
  name: string;
  item_ids: {
    id: number;
    name: string;
    need_support_doc: boolean;
    need_summary_report: boolean;
    summary_report_file: File | null;
    site_ids: number[];
  }[];
};

type ClaimData = {
  phase_id: number;
  category_ids: CategoryData[];
};

type ClaimApplicationFormProps = ClaimData & {
  updateFields: (fields: Partial<ClaimData>) => void;
};

export function ClaimApplicationForm({
  phase_id,
  category_ids,
  updateFields,
}: ClaimApplicationFormProps) {
  const { categories } = useClaimCategorySimple();
  const { phases, fetchSitesByPhase } = useSiteByPhase();
  const [sites, setSites] = useState<{ id: number; name: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ categoryId: number; itemId: number } | null>(null);
  const [tempSelectedSites, setTempSelectedSites] = useState<number[]>([]);

  const handleFetchSites = async (phaseId: number) => {
    const fetchedSites = await fetchSitesByPhase(phaseId);
    setSites(
      fetchedSites.map((site: { id: number; fullname: string }) => ({
        id: site.id,
        name: site.fullname,
      }))
    );
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
      setTempSelectedSites(existing);
    }
  }, [selectedItem]);

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
        category_ids: category_ids.map((category) =>
          category.id === categoryId
            ? {
              ...category,
              item_ids: category.item_ids.map((item) =>
                item.id === itemId
                  ? {
                    ...item,
                    site_ids: tempSelectedSites,
                    summary_report_file: null, // Reset the summary_report_file
                  }
                  : item
              ),
            }
            : category
        ),
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
            updateFields({ phase_id: Number(value) });
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
                  {category.children.map((item, index) => (
                    <TableRow key={item.id} >
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
                            updateFields({
                              category_ids: checked
                                ? [
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
                                        summary_report_file: null, // Reset file on selection
                                        site_ids: [],
                                      },
                                    ],
                                  },
                                ]
                                : category_ids
                                  .map((cat) =>
                                    cat.id === category.id
                                      ? {
                                        ...cat,
                                        item_ids: cat.item_ids.filter((i) => i.id !== item.id),
                                      }
                                      : cat
                                  )
                                  .filter((cat) => cat.item_ids.length > 0),
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {sites.length > 0 ? (
              sites.map((site) => (
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
                  <span>{site.name}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full">
                No sites available. Please select a phase.
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
