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
  existingFiles?: Array<{ url: string; name: string }> | null;
  onExistingFilesChange?: (files: Array<{ url: string; name: string }>) => void;
  children?: React.ReactNode;
  multiple?: boolean;
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
      existingFiles = null,
      onExistingFilesChange,
      multiple = false,
      children,
      ...props
    },
    ref
  ) => {
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isDraggingInvalidFile, setIsDraggingInvalidFile] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropZoneRef = React.useRef<HTMLDivElement>(null);
    
    // Update maxFiles based on multiple prop
    const effectiveMaxFiles = multiple ? maxFiles : 1;

    // Handle existing files display
    const initialExistingFiles = React.useMemo(() => {
      if (existingFiles) {
        return existingFiles;
      } else if (existingFile) {
        return [existingFile];
      }
      return [];
    }, [existingFile, existingFiles]);

    const [displayedExistingFiles, setDisplayedExistingFiles] = React.useState(initialExistingFiles);

    React.useEffect(() => {
      const newExistingFiles = existingFiles || (existingFile ? [existingFile] : []);
      setDisplayedExistingFiles(newExistingFiles.filter(Boolean));
    }, [existingFile, existingFiles]);

    // Add reset method to the component
    React.useImperativeHandle(ref, () => ({
      ...inputRef.current,
      reset: () => {
        setSelectedFiles([]);
        setError(null);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        if (onFilesSelected) {
          onFilesSelected([]);
        }
      }
    }));

    // Check if dragged files are valid (for drag-and-drop validation)
    const checkDraggedFilesValidity = (dataTransfer: DataTransfer | null): boolean => {
      if (!dataTransfer || (!dataTransfer.items.length && !dataTransfer.files.length)) return true;
      
      // Skip checking if no specific file types are required
      if (!acceptedFileTypes) return true;
      
      const acceptedTypes = acceptedFileTypes.split(',').map(type => type.trim().toLowerCase());
      
      // Try to use DataTransferItems first (for dragover) then fall back to files (for drop)
      const items = dataTransfer.items;
      
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          // Only process file items
          if (item.kind === 'file') {
            const fileType = item.type; // MIME type
            
            // For drag events, we might only have MIME type and not the extension
            const isValidType = acceptedTypes.some(type => {
              // Handle mimetype patterns (image/*)
              if (type.includes('/')) {
                return fileType.match(new RegExp(type.replace('*', '.*')));
              } else {
                // For extensions, we can only make a guess during dragover
                // This is less accurate but better than nothing
                return fileType && 
                       ((type === '.pdf' && fileType === 'application/pdf') ||
                        (type === '.jpg' && (fileType === 'image/jpeg' || fileType === 'image/jpg')) ||
                        (type === '.jpeg' && (fileType === 'image/jpeg' || fileType === 'image/jpg')) ||
                        (type === '.png' && fileType === 'image/png') ||
                        (type === '.gif' && fileType === 'image/gif'));
              }
            });
            
            if (!isValidType) return false;
          }
        }
      } else {
        // Use FileList if DataTransferItems is not available
        const files = dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
          const isValidType = acceptedTypes.some(type => {
            if (type.includes('/')) {
              return file.type.match(new RegExp(type.replace('*', '.*')));
            } else {
              return fileExtension === type;
            }
          });
          
          if (!isValidType) return false;
        }
      }
      
      return true;
    };

    const validateFiles = (filesToValidate: File[]): File[] | null => {
      setError(null);

      // Validate number of files
      const newTotalFiles = multiple 
        ? [...selectedFiles, ...filesToValidate]
        : filesToValidate;

      if (newTotalFiles.length > effectiveMaxFiles) {
        setError(
          `You can only upload up to ${effectiveMaxFiles} file${
            effectiveMaxFiles === 1 ? "" : "s"
          }`
        );
        return null;
      }

      // Validate file size - check each file individually
      const oversizedFiles = filesToValidate.filter(
        (file) => file.size > maxSizeInMB * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError(`Each file must be less than ${maxSizeInMB}MB`);
        return null;
      }

      // Validate file type if acceptedFileTypes is provided
      if (acceptedFileTypes) {
        const acceptedTypes = acceptedFileTypes.split(',').map(type => type.trim().toLowerCase());
        
        // Check if any file doesn't match the accepted types
        const invalidFiles = filesToValidate.filter(file => {
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
          return !acceptedTypes.some(type => {
            // Handle both mimetype patterns (image/*) and extensions (.pdf)
            if (type.includes('/')) {
              return file.type.match(new RegExp(type.replace('*', '.*')));
            } else {
              return fileExtension === type;
            }
          });
        });

        if (invalidFiles.length > 0) {
          setError(`Only ${acceptedFileTypes} files are allowed`);
          return null;
        }
      }

      return multiple ? [...selectedFiles, ...filesToValidate] : filesToValidate;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const filesArray = Array.from(event.target.files);
      const validatedFiles = validateFiles(filesArray);

      if (validatedFiles) {
        setSelectedFiles(validatedFiles);
        if (onFilesSelected) {
          onFilesSelected(validatedFiles);
        }
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

    const handleRemoveExistingFile = (index: number) => {
      const newFiles = [...displayedExistingFiles];
      newFiles.splice(index, 1);
      setDisplayedExistingFiles(newFiles);
      
      // Notify parent component about the change
      if (onExistingFilesChange) {
        onExistingFilesChange(newFiles);
      }
    };

    const triggerFileInput = () => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    };

    // Update the total count to include both selected and existing files
    const totalFileCount = selectedFiles.length + displayedExistingFiles.length;

    const getPlaceholderText = () => {
      if (totalFileCount >= effectiveMaxFiles) {
        return "Maximum number of files reached";
      }
      
      return `Drag and drop your file${multiple ? "s" : ""} here, or click to browse`;
    };

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (totalFileCount < effectiveMaxFiles) {
        const isValidFileType = checkDraggedFilesValidity(e.dataTransfer);
        setIsDraggingInvalidFile(!isValidFileType);
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Only set isDragging to false if we're leaving the dropzone (not a child element)
      if (e.currentTarget === e.target) {
        setIsDragging(false);
        setIsDraggingInvalidFile(false);
        // Clear any drag-related error messages when drag ends
        if (error && isDraggingInvalidFile) {
          setError(null);
        }
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (totalFileCount < effectiveMaxFiles) {
        const isValidFileType = checkDraggedFilesValidity(e.dataTransfer);
        
        // Set the drop effect based on file type validity
        e.dataTransfer.dropEffect = isValidFileType ? "copy" : "none";
        
        setIsDraggingInvalidFile(!isValidFileType);
        setIsDragging(true);
        
        // Show error message for invalid file types during drag only
        if (!isValidFileType && acceptedFileTypes) {
          setError(`Only ${acceptedFileTypes} files are allowed`);
        } else if (isDraggingInvalidFile) {
          // Clear error if file is now valid
          setError(null);
        }
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setIsDraggingInvalidFile(false);
      
      // Clear drag-related error messages
      if (error && isDraggingInvalidFile) {
        setError(null);
      }
      
      if (totalFileCount >= effectiveMaxFiles) return;
      
      // Check file type validity before processing
      const isValidFileType = checkDraggedFilesValidity(e.dataTransfer);
      
      if (!isValidFileType) {
        setError(`Only ${acceptedFileTypes} files are allowed`);
        return;
      }
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validatedFiles = validateFiles(droppedFiles);
        
        if (validatedFiles) {
          setSelectedFiles(validatedFiles);
          if (onFilesSelected) {
            onFilesSelected(validatedFiles);
          }
        }
      }
    };

    return (
      <div className={cn("space-y-4", className)}>
        <div
          ref={dropZoneRef}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragging && !isDraggingInvalidFile ? "border-primary bg-primary/10" : 
              isDraggingInvalidFile ? "border-destructive bg-destructive/10" : "hover:bg-muted/50",
            error && !isDragging ? "border-destructive" : 
              !isDragging ? "border-muted-foreground/20" : "",
            totalFileCount >= effectiveMaxFiles ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            className // Apply the className directly to the dropzone div
          )}
          onClick={totalFileCount < effectiveMaxFiles ? triggerFileInput : undefined}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className={cn(
            "h-10 w-10 mx-auto mb-2",
            isDraggingInvalidFile ? "text-destructive" : "text-muted-foreground"
          )} />
          <p className={cn(
            "text-sm mb-1",
            isDraggingInvalidFile ? "text-destructive" : "text-muted-foreground"
          )}>
            {isDraggingInvalidFile 
              ? `Only ${acceptedFileTypes} files are allowed` 
              : getPlaceholderText()
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {acceptedFileTypes ? `Accepted formats: ${acceptedFileTypes}` : ""}
            {acceptedFileTypes && maxSizeInMB ? " • " : ""}
            {maxSizeInMB ? `Each file max ${maxSizeInMB}MB` : ""}
            {effectiveMaxFiles > 1 ? ` • Max ${effectiveMaxFiles} files` : ""}
          </p>
          <Input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={acceptedFileTypes}
            multiple={multiple}
            disabled={totalFileCount >= effectiveMaxFiles}
            {...props}
          />
        </div>

        {/* Only show error message below the upload box if it's not related to dragging */}
        {error && !isDraggingInvalidFile && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}

        {/* Show existing files */}
        {displayedExistingFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Existing File{displayedExistingFiles.length > 1 ? "s" : ""}:</p>
            <div className="grid gap-2">
              {displayedExistingFiles.map((file, index) => (
                <div
                  key={`existing-${index}`}
                  className="flex items-center p-2 border rounded-md bg-muted/30"
                >
                  <File className="h-4 w-4 mr-2" />
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline flex-1 truncate"
                  >
                    {file.name}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExistingFile(index);
                    }}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show selected files */}
        {showPreview && selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected file{selectedFiles.length > 1 ? "s" : ""}:</p>
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

        {totalFileCount < effectiveMaxFiles && (
          <Button 
            type="button" 
            onClick={triggerFileInput} 
            className="mt-2"
            disabled={totalFileCount >= effectiveMaxFiles}
          >
            {children}
            {!children && buttonText}
          </Button>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
