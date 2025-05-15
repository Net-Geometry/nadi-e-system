import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload"; // Import the FileUpload component

type FileData = {
  name: string; // File name
  url: string;  // File URL or path
};


type ClaimData = {
  category_id: string;
  item_id: string;
  status_item: boolean | string | null;
  request_remark: string;
  need_support_doc: boolean | string | null;
  need_summary_report: boolean | string | null;
  claim_type_id_support: string;
  file_path_support: FileData[]; // Changed to an array of objects
  claim_type_id_summary: string;
  file_path_summary: FileData[]; // Changed to an array of objects

};

type ClaimRequestFormProps = ClaimData & {
  updateFields: (fields: Partial<ClaimData>) => void;
  categories: { id: string; name: string; description: string }[];
  items: { id: string; name: string; description: string; need_support_doc: boolean; need_summary_report: boolean; }[];
  fetchItemsByCategory: (categoryId: string) => Promise<void>;
};

export function ClaimRequestForm({
  category_id,
  item_id,
  status_item,
  request_remark,
  need_support_doc,
  need_summary_report,
  file_path_support,
  file_path_summary,
  updateFields,
  categories,
  items,
  fetchItemsByCategory,
}: ClaimRequestFormProps) {
  // Handle file uploads for Support Document
  const handleSupportDocUpload = (files: File[]) => {
    const fileData = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file), // Replace with actual file upload logic
    }));
    updateFields({ file_path_support: fileData });
  };

  // Handle file uploads for Summary Report
  const handleSummaryReportUpload = (files: File[]) => {
    const fileData = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file), // Replace with actual file upload logic
    }));
    updateFields({ file_path_summary: fileData });
  };

  return (
    <>
      <DialogTitle className="mb-4">Attachment</DialogTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Select */}
        <div className="space-y-2">
          <Label className="flex items-center">Category</Label>
          <Select
            value={category_id || ""}
            onValueChange={(value) => {
              updateFields({ category_id: value, item_id: "" });
              fetchItemsByCategory(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item Select */}
        <div className="space-y-2">
          <Label className="flex items-center">Item</Label>
          <Select
            value={item_id || ""}
            onValueChange={(value) => {
              const selectedItem = items.find((item) => item.id.toString() === value);
              updateFields({
                item_id: value.toString(),
                need_support_doc: selectedItem?.need_support_doc || false,
                need_summary_report: selectedItem?.need_summary_report || false,
              });
            }}
            disabled={!category_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Request Remark */}
        <div className="space-y-2 col-span-2">
          <Label className="flex items-center">Remark of the item</Label>
          <Input
            type="text"
            value={request_remark || ""}
            onChange={(e) => updateFields({ request_remark: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Need Support Document */}
        {need_support_doc && (
          <div className="space-y-2 col-span-2">
            <Label className="flex items-center">Supporting Document Required</Label>
            <FileUpload
              maxFiles={5}
              acceptedFileTypes=".pdf,.doc,.docx,.jpg,.png"
              maxSizeInMB={10}
              onFilesSelected={handleSupportDocUpload}
              multiple={true}
              existingFiles={file_path_support.map((file) => ({
                url: file.url,
                name: file.name,
              }))}
              onExistingFilesChange={(files) =>
                updateFields({
                  file_path_support: files.map((file) => ({
                    name: file.name,
                    url: file.url,
                  })),
                })
              }
            />
            <p className="text-sm text-gray-500">
              Upload support documents. Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max 5 files, each up to 10MB.
            </p>
          </div>
        )}

        {/* Need Summary Report */}
        {need_summary_report && (
          <div className="space-y-2 col-span-2">
            <Label className="flex items-center">Summary Report Required</Label>
            <FileUpload
              maxFiles={5}
              acceptedFileTypes=".pdf,.doc,.docx,.jpg,.png"
              maxSizeInMB={10}
              onFilesSelected={handleSummaryReportUpload}
              multiple={true}
              existingFiles={file_path_summary.map((file) => ({
                url: file.url,
                name: file.name,
              }))}
              onExistingFilesChange={(files) =>
                updateFields({
                  file_path_summary: files.map((file) => ({
                    name: file.name,
                    url: file.url,
                  })),
                })
              }
            />
            <p className="text-sm text-gray-500">
              Upload summary reports. Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max 5 files, each up to 10MB.
            </p>
          </div>
        )}
      </div>
    </>
  );
}