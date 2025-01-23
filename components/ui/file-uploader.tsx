"use client";

import * as React from "react";
import Image from "next/image";
import { FileText, Upload, X, Check } from "lucide-react";
import Dropzone, {
    type DropzoneProps,
    type FileRejection,
} from "react-dropzone";

import { cn, formatBytes } from "@/lib/utils";
import { useControllableState } from "@/hooks/use-controllable-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
/** Adjust this to your shadcn Alert component path */
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

/**
 * Define a lookup for MIME types => user-friendly labels.
 * Add or customize as you wish.
 */
const MIME_TYPE_LABELS: Record<string, string> = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "Microsoft Excel (.xlsx)",
    "image/*": "Images",
    "application/pdf": "PDF Files",
    // etc.
};

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Value of the uploader.
     */
    value?: File[];

    /**
     * Function to be called when the value changes.
     */
    onValueChange?: (files: File[]) => void;

    /**
     * Function to be called when files are uploaded.
     */
    onUpload?: (files: File[]) => Promise<void>;

    /**
     * Progress of the uploaded files.
     */
    progresses?: Record<string, number>;

    /**
     * Accepted file types for the uploader.
     */
    accept?: DropzoneProps["accept"];

    /**
     * Maximum file size for the uploader.
     */
    maxSize?: DropzoneProps["maxSize"];

    /**
     * Maximum number of files for the uploader.
     */
    maxFileCount?: DropzoneProps["maxFiles"];

    /**
     * Whether the uploader should accept multiple files.
     */
    multiple?: boolean;

    /**
     * Whether the uploader is disabled.
     */
    disabled?: boolean;
}

type UploadState = "idle" | "uploading" | "success";

export function FileUploader(props: FileUploaderProps) {
    const {
        value: valueProp,
        onValueChange,
        onUpload,
        progresses,
        accept = {
            "image/*": [],
        },
        maxSize = 1024 * 1024 * 2,
        maxFileCount = 1,
        multiple = false,
        disabled = false,
        className,
        ...dropzoneProps
    } = props;

    const [files, setFiles] = useControllableState({
        prop: valueProp,
        onChange: onValueChange,
    });

    // Track overall upload state for the drop zone
    const [uploadState, setUploadState] = React.useState<UploadState>("idle");

    // Store any errors here to display them below the drop zone
    const [uploadErrors, setUploadErrors] = React.useState<string[]>([]);

    /**
     * Returns a single string listing all accepted mime-types or patterns
     * in a user-friendly manner.
     */
    function getFriendlyAcceptLabels(): string {
        if (!accept) return "";
        const mimeTypes = Object.keys(accept);
        return mimeTypes
            .map((mime) => MIME_TYPE_LABELS[mime] ?? mime)
            .join(", ");
    }

    const onDrop = React.useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            // Clear errors on each new drop
            setUploadErrors([]);
            setUploadState("idle");

            // 1) Check for max file count
            if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
                setUploadErrors((prev) => [
                    ...prev,
                    "Cannot upload more than 1 file at a time.",
                ]);
                return;
            }
            if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
                setUploadErrors((prev) => [
                    ...prev,
                    `Cannot upload more than ${maxFileCount} file${
                        maxFileCount > 1 ? "s" : ""
                    }.`,
                ]);
                return;
            }

            // 2) Map accepted files, build preview
            const newFiles = acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                })
            );
            const updatedFiles = files ? [...files, ...newFiles] : newFiles;
            setFiles(updatedFiles);

            // 3) Handle rejections and show them as shadcn Alerts
            if (rejectedFiles.length > 0) {
                const friendlyAcceptText = getFriendlyAcceptLabels();

                const newErrors: string[] = rejectedFiles.flatMap(
                    ({ file, errors }) => {
                        return errors.map((e) => {
                            switch (e.code) {
                                case "file-invalid-type":
                                    return `File "${file.name}" is not a supported file type. 
Supported types: ${friendlyAcceptText}.`;

                                case "file-too-large":
                                    return `File "${
                                        file.name
                                    }" exceeds the max size of ${formatBytes(
                                        maxSize as number
                                    )}.`;

                                default:
                                    return `File "${file.name}" was rejected: ${e.message}`;
                            }
                        });
                    }
                );
                setUploadErrors((prev) => [...prev, ...newErrors]);
            }

            // 4) If onUpload is given, attempt to upload
            if (
                onUpload &&
                updatedFiles.length > 0 &&
                updatedFiles.length <= maxFileCount &&
                rejectedFiles.length === 0
            ) {
                // Start “uploading” state
                setUploadState("uploading");

                onUpload(updatedFiles)
                    .then(() => {
                        setUploadState("success");
                        // If you want to clear files once uploaded, do:
                        // setFiles([]);
                    })
                    .catch((err) => {
                        setUploadErrors((prev) => [
                            ...prev,
                            `Failed to upload: ${err?.message ?? ""}`,
                        ]);
                        setUploadState("idle");
                    });
            }
        },
        [
            accept,
            files,
            maxFileCount,
            multiple,
            onUpload,
            setFiles,
            maxSize,
            getFriendlyAcceptLabels,
        ]
    );

    function onRemove(index: number) {
        if (!files) return;
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onValueChange?.(newFiles);
    }

    // Revoke preview url when component unmounts
    React.useEffect(() => {
        return () => {
            if (!files) return;
            files.forEach((file) => {
                if (isFileWithPreview(file)) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

    return (
        <div className="relative flex w-[600px] flex-col gap-6 overflow-hidden bg-foreground/5 mx-auto">
            <Dropzone
                onDrop={onDrop}
                accept={accept}
                maxSize={maxSize}
                maxFiles={maxFileCount}
                multiple={maxFileCount > 1 || multiple}
                disabled={isDisabled}
            >
                {({ getRootProps, getInputProps, isDragActive }) => {
                    // Conditionally render content in the drop zone based on uploadState
                    let dropzoneContent: React.ReactNode;

                    if (uploadState === "uploading") {
                        // Show spinning upload icon + text
                        dropzoneContent = (
                            <div className="flex flex-col items-center justify-center gap-4 sm:px-5 transition-all duration-300">
                                <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                    <Upload
                                        className="size-7 text-muted-foreground animate-spin"
                                        aria-hidden="true"
                                    />
                                </div>
                                <p className="font-medium text-muted-foreground">
                                    Uploading your file...
                                </p>
                            </div>
                        );
                    } else if (uploadState === "success") {
                        // Show checkmark + success text
                        dropzoneContent = (
                            <div className="flex flex-col items-center justify-center gap-4 sm:px-5 transition-all duration-300">
                                <div className="rounded-full border border-dashed border-green-500 p-3">
                                    <Check
                                        className="size-7 text-green-500"
                                        aria-hidden="true"
                                    />
                                </div>
                                <p className="font-medium text-green-500">
                                    Template uploaded successfully!
                                </p>
                            </div>
                        );
                    } else {
                        // uploadState = "idle"
                        if (isDragActive) {
                            dropzoneContent = (
                                <div className="flex flex-col items-center justify-center gap-4 sm:px-5 opacity-50">
                                    <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                        <Upload
                                            className="size-7 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <p className="font-medium text-muted-foreground">
                                        Drop it like it&apos;s hot!
                                    </p>
                                </div>
                            );
                        } else {
                            dropzoneContent = (
                                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                                    <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                        <Upload
                                            className="size-7 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-px">
                                        <p className="font-medium text-muted-foreground">
                                            Drag &apos;n&apos; drop a file here.
                                        </p>
                                        <p className="text-sm text-muted-foreground/70">
                                            Or click to browse for the file.
                                        </p>
                                    </div>
                                </div>
                            );
                        }
                    }

                    return (
                        <div
                            {...getRootProps()}
                            className={cn(
                                "group relative grid h-80 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
                                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                isDragActive && "border-muted-foreground/50",
                                isDisabled && "pointer-events-none opacity-60",
                                className
                            )}
                            {...dropzoneProps}
                        >
                            <input {...getInputProps()} />
                            {dropzoneContent}
                        </div>
                    );
                }}
            </Dropzone>

            {/* Show errors below the drop zone */}
            {uploadErrors.length > 0 && (
                <div className="flex flex-col gap-2 px-4">
                    {uploadErrors.map((error, idx) => (
                        <Alert
                            variant="destructive"
                            key={idx}
                            className="mb-3 bg-background"
                        >
                            <AlertTitle className="font-bold">Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            )}

            {/* List of files (if any) */}
            {files?.length ? (
                <ScrollArea className="h-fit w-full px-3">
                    <div className="flex max-h-48 flex-col gap-4">
                        {files?.map((file, index) => (
                            <FileCard
                                key={index}
                                file={file}
                                onRemove={() => onRemove(index)}
                                progress={progresses?.[file.name]}
                            />
                        ))}
                    </div>
                </ScrollArea>
            ) : null}
        </div>
    );
}

interface FileCardProps {
    file: File;
    onRemove: () => void;
    progress?: number;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
    return (
        <div className="relative flex items-center gap-2.5">
            <div className="flex flex-1 gap-2.5">
                {isFileWithPreview(file) ? <FilePreview file={file} /> : null}
                <div className="flex w-full flex-col gap-2">
                    <div className="flex flex-col gap-px">
                        <p className="line-clamp-1 text-sm font-medium text-foreground/80">
                            {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                        </p>
                    </div>
                    {typeof progress === "number" && (
                        <Progress value={progress} />
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={onRemove}
                >
                    <X
                        className="size-4"
                        aria-hidden="true"
                    />
                    <span className="sr-only">Remove file</span>
                </Button>
            </div>
        </div>
    );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
    return "preview" in file && typeof file.preview === "string";
}

interface FilePreviewProps {
    file: File & { preview: string };
}

function FilePreview({ file }: FilePreviewProps) {
    if (file.type.startsWith("image/")) {
        return (
            <Image
                src={file.preview}
                alt={file.name}
                width={48}
                height={48}
                loading="lazy"
                className="aspect-square shrink-0 rounded-md object-cover"
            />
        );
    }

    return (
        <FileText
            className="size-10 text-muted-foreground"
            aria-hidden="true"
        />
    );
}
