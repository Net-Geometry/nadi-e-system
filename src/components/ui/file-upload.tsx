import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, File, X } from "lucide-react";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesSelected?: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string;
  maxSizeInMB?: number;
  buttonText?: string;
  showPreview?: boolean;
  existingFile?: { url: string; name: string } | null;
  children?: React.ReactNode;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      onFilesSelected,
      maxFiles = 1,
      acceptedFileTypes,
      maxSizeInMB = 5,
      buttonText = "Upload File",
      showPreview = true,
      existingFile = null,
      children,
      ...props
    },
    ref
  ) => {
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const filesArray = Array.from(event.target.files);

      // Validate number of files
      if (filesArray.length > maxFiles) {
        setError(
          `You can only upload up to ${maxFiles} file${
            maxFiles === 1 ? "" : "s"
          }`
        );
        return;
      }

      // Validate file size
      const oversizedFiles = filesArray.filter(
        (file) => file.size > maxSizeInMB * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError(`Files must be less than ${maxSizeInMB}MB`);
        return;
      }

      setSelectedFiles(filesArray);

      if (onFilesSelected) {
        onFilesSelected(filesArray);
      }
    };

    const handleRemoveFile = (index: number) => {
      const newFiles = [...selectedFiles];
      newFiles.splice(index, 1);
      setSelectedFiles(newFiles);

      if (onFilesSelected) {
        onFilesSelected(newFiles);
      }

      // Reset the input value to allow selecting the same file again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const triggerFileInput = () => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    };

    return (
      <div className={cn("space-y-4", className)}>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors",
            error ? "border-destructive" : "border-muted-foreground/20"
          )}
          onClick={triggerFileInput}
        >
          <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            Drag and drop your file{maxFiles > 1 ? "s" : ""} here, or click to
            browse
          </p>
          <p className="text-xs text-muted-foreground">
            {acceptedFileTypes ? `Accepted formats: ${acceptedFileTypes}` : ""}
            {acceptedFileTypes && maxSizeInMB ? " • " : ""}
            {maxSizeInMB ? `Max ${maxSizeInMB}MB` : ""}
          </p>
          <Input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={acceptedFileTypes}
            multiple={maxFiles > 1}
            {...props}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}

        {/* Show existing file if provided */}
        {existingFile && !selectedFiles.length && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Existing File:</p>
            <div className="flex items-center p-2 border rounded-md bg-muted/30">
              <File className="h-4 w-4 mr-2" />
              <a
                href={existingFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline flex-1 truncate"
              >
                {existingFile.name}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setSelectedFiles([]); // Clear selected files
                  if (inputRef.current) {
                    inputRef.current.value = ""; // Reset input
                  }
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          </div>
        )}

        {/* Show selected files */}

        {showPreview && selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected files:</p>
            <div className="grid gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center p-2 border rounded-md bg-muted/30"
                >
                  <File className="h-4 w-4 mr-2" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type="button" onClick={triggerFileInput} className="mt-2">
          {children}
          {!children && buttonText}
        </Button>
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
