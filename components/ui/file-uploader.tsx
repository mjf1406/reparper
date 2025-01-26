"use client";

// cspell:ignore openxmlformats officedocument spreadsheetml

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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

/**
 * Moved the PDF filename pattern outside the component
 * (to avoid creating a new RegExp on every render).
 */
const PDF_FILENAME_PATTERN =
    /^[1-6]-[1-4]\sS[12]\s(?:Boys|Girls)\s\d{4}-\d{2}$/;

/**
 * By extending Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop">,
 * we avoid type conflicts with the HTML onDrop vs. react-dropzone's onDrop.
 */
interface FileUploaderProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> {
    /**
     * Value of the uploader.
     */
    value?: File[];

    /**
     * Function to be called when the value changes.
     */
    onValueChange?: (files: File[]) => void;

    /**
     * Function to be called when both files are fully ready to be processed.
     */
    onUpload?: (files: File[]) => Promise<void>;

    /**
     * Optional progress for each file, if needed.
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

/**
 * FileUploader
 */
export function FileUploader(props: FileUploaderProps) {
    const {
        value: valueProp,
        onValueChange,
        onUpload,
        progresses,
        accept = {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [],
            "application/pdf": [],
        },
        maxSize = 1024 * 1024 * 15, // e.g. 15 MB
        maxFileCount = 2,
        multiple = true,
        disabled = false,
        className,
        ...dropzoneProps
    } = props;

    // Prevent passing an incompatible onError to Dropzone
    const { onError: _unusedOnError, ...restDropzoneProps } = dropzoneProps;
    if (_unusedOnError) console.error(_unusedOnError);

    const [files, setFiles] = useControllableState({
        prop: valueProp,
        onChange: onValueChange,
    });

    const [uploadState, setUploadState] = React.useState<UploadState>("idle");
    const [uploadErrors, setUploadErrors] = React.useState<string[]>([]);

    const onDrop = React.useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            // Clear errors on each new drop
            setUploadErrors([]);
            // We'll re-check the file state, so revert to "idle" for partial messages
            setUploadState("idle");

            const newErrors: string[] = [];
            const newValidFiles: File[] = [];

            // 1) Validate each accepted file
            for (const file of acceptedFiles) {
                // 1a) Check overall file count
                if ((files?.length ?? 0) + newValidFiles.length >= 2) {
                    newErrors.push(
                        "Cannot upload more than 2 files (1 XLSX + 1 PDF)."
                    );
                    continue;
                }

                // 1b) Validate XLSX
                if (
                    file.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ) {
                    if (!file.name.includes("Reparper Template")) {
                        newErrors.push(
                            `XLSX "${file.name}" must contain "Reparper Template" in its name.`
                        );
                        continue;
                    }
                    // Ensure we haven't already got an XLSX
                    const alreadyHasXlsx = [
                        ...(files ?? []),
                        ...newValidFiles,
                    ].some(
                        (f) =>
                            f.type ===
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
                    if (alreadyHasXlsx) {
                        newErrors.push("You can only upload one XLSX file.");
                        continue;
                    }
                }
                // 1c) Validate PDF
                else if (file.type === "application/pdf") {
                    const filenameWithoutExtension = file.name.replace(
                        /\.pdf$/i,
                        ""
                    );
                    if (!PDF_FILENAME_PATTERN.test(filenameWithoutExtension)) {
                        newErrors.push(
                            `PDF "${file.name}" does not match the naming pattern (e.g. "5-4 S2 Girls 2024-25").`
                        );
                        continue;
                    }
                    // Ensure we haven't already got a PDF
                    const alreadyHasPdf = [
                        ...(files ?? []),
                        ...newValidFiles,
                    ].some((f) => f.type === "application/pdf");
                    if (alreadyHasPdf) {
                        newErrors.push("You can only upload one PDF file.");
                        continue;
                    }
                }
                // 1d) Invalid type
                else {
                    newErrors.push(
                        `File "${file.name}" is not a supported file type.`
                    );
                    continue;
                }

                // 1e) Passed checks -> store w/ preview
                newValidFiles.push(
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                );
            }

            // 2) Handle rejections from Dropzone
            if (rejectedFiles.length > 0) {
                const rejections = rejectedFiles.flatMap(({ file, errors }) => {
                    return errors.map((err) => {
                        switch (err.code) {
                            case "file-invalid-type":
                                return `File "${file.name}" is not a supported file type.`;
                            case "file-too-large":
                                return `File "${
                                    file.name
                                }" exceeds the max size of ${formatBytes(
                                    maxSize as number
                                )}.`;
                            default:
                                return `File "${file.name}" was rejected: ${err.message}`;
                        }
                    });
                });
                newErrors.push(...rejections);
            }

            // 3) If we have new errors, do not add files
            if (newErrors.length > 0) {
                setUploadErrors(newErrors);
                return;
            }

            // 4) No new errors => merge new valid files with existing
            const updatedFiles = [...(files ?? []), ...newValidFiles];
            setFiles(updatedFiles);

            // 5) Check if we *now* have both XLSX and PDF
            const hasXlsx = updatedFiles.some((f) =>
                f.type.includes("spreadsheetml")
            );
            const hasPdf = updatedFiles.some(
                (f) => f.type === "application/pdf"
            );

            if (onUpload && hasXlsx && hasPdf) {
                // We have both files, so let's call onUpload
                setUploadState("uploading");
                onUpload(updatedFiles)
                    .then(() => {
                        setUploadState("success");
                    })
                    .catch((err) => {
                        setUploadErrors((prev) => [
                            ...prev,
                            `Failed to upload: ${err?.message ?? ""}`,
                        ]);
                        setUploadState("idle");
                    });
            } else {
                // Otherwise, remain "idle" so user sees partial instructions
                setUploadState("idle");
            }
        },
        [files, maxSize, onUpload, setFiles]
    );

    function onRemove(index: number) {
        if (!files) return;
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onValueChange?.(newFiles);

        // If we remove a file, revert to "idle" and clear errors
        setUploadState("idle");
        setUploadErrors([]);
    }

    // Cleanup previews on unmount
    React.useEffect(() => {
        return () => {
            files?.forEach((file) => {
                if (isFileWithPreview(file)) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
        // We only want to run this once on unmount, so no deps here.
    }, [files]);

    const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

    return (
        <div className="relative mx-auto flex w-[600px] flex-col gap-6 overflow-hidden bg-foreground/5">
            <Dropzone
                onDrop={onDrop}
                accept={accept}
                maxSize={maxSize}
                maxFiles={maxFileCount}
                multiple={multiple}
                disabled={isDisabled}
                {...restDropzoneProps}
            >
                {({ getRootProps, getInputProps, isDragActive }) => {
                    let dropzoneContent: React.ReactNode;

                    if (uploadState === "uploading") {
                        // Show “uploading…” spinner
                        dropzoneContent = (
                            <div className="flex flex-col items-center justify-center gap-4 transition-all duration-300 sm:px-5">
                                <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                    <Upload
                                        className="size-7 animate-spin text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </div>
                                <p className="font-medium text-muted-foreground">
                                    Uploading your files...
                                </p>
                            </div>
                        );
                    } else if (uploadState === "success") {
                        // Show final success message
                        dropzoneContent = (
                            <div className="flex flex-col items-center justify-center gap-4 transition-all duration-300 sm:px-5">
                                <div className="rounded-full border border-dashed border-green-500 p-3">
                                    <Check
                                        className="size-7 text-green-800 dark:text-green-500"
                                        aria-hidden="true"
                                    />
                                </div>
                                <p className="font-medium text-green-800 dark:text-green-500">
                                    Files uploaded successfully!
                                </p>
                            </div>
                        );
                    } else {
                        // "idle" => show partial instructions
                        const hasXlsx = files?.some((f) =>
                            f.type.includes("spreadsheetml")
                        );
                        const hasPdf = files?.some(
                            (f) => f.type === "application/pdf"
                        );

                        if (hasXlsx && hasPdf) {
                            dropzoneContent = (
                                <div className="flex flex-col items-center justify-center gap-4 transition-all duration-300 sm:px-5">
                                    <div className="rounded-full border border-dashed border-green-500 p-3">
                                        <Check
                                            className="size-7 text-green-800 dark:text-green-500"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <p className="font-medium text-green-800 dark:text-green-500">
                                        Both files present! Ready to finalize.
                                    </p>
                                </div>
                            );
                        } else if (hasXlsx && !hasPdf) {
                            // XLSX present, need PDF
                            dropzoneContent = isDragActive ? (
                                <div className="flex flex-col items-center justify-center gap-4 opacity-50 sm:px-5">
                                    <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                        <Upload
                                            className="size-7 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <p className="font-medium text-muted-foreground">
                                        Drop your PDF now!
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                                    <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                        <Upload
                                            className="size-7 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <p className="font-medium text-muted-foreground">
                                        Just the PDF left!
                                        <br />
                                        Drag & drop it here or click to browse.
                                    </p>
                                </div>
                            );
                        } else if (!hasXlsx && hasPdf) {
                            // PDF present, need XLSX
                            dropzoneContent = isDragActive ? (
                                <div className="flex flex-col items-center justify-center gap-4 opacity-50 sm:px-5">
                                    <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                        <Upload
                                            className="size-7 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <p className="font-medium text-muted-foreground">
                                        Drop your XLSX now!
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                                    <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                        <Upload
                                            className="size-7 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <p className="font-medium text-muted-foreground">
                                        Just the XLSX left!
                                        <br />
                                        Drag & drop it here or click to browse.
                                    </p>
                                </div>
                            );
                        } else {
                            // Neither file
                            dropzoneContent = isDragActive ? (
                                <div className="flex flex-col items-center justify-center gap-4 opacity-50 sm:px-5">
                                    <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                        <Upload
                                            className="size-7 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <p className="font-medium text-muted-foreground">
                                        Drop it like it’s hot!
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                                    <div className="rounded-full border border-dashed border-muted-foreground p-3">
                                        <Upload
                                            className="size-7 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-px">
                                        <p className="font-medium text-muted-foreground">
                                            Drag &apos;n&apos; drop your{" "}
                                            <i>Reparper Template.xlsx</i> and{" "}
                                            <i>Report Card Template</i> here.
                                        </p>
                                        <p className="text-sm text-muted-foreground/70">
                                            Or click to browse for them.
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
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                                isDragActive && "border-muted-foreground/50",
                                isDisabled && "pointer-events-none opacity-60",
                                className
                            )}
                        >
                            <input {...getInputProps()} />
                            {dropzoneContent}
                        </div>
                    );
                }}
            </Dropzone>

            {/* Show any errors */}
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

            {/* File List */}
            {files?.length ? (
                <ScrollArea className="h-fit w-full px-3">
                    <div className="flex max-h-48 flex-col gap-4">
                        {files.map((file, index) => (
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

/**
 * FileCard + helpers
 */
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
    // For non-image files, show a generic file icon
    return (
        <FileText
            className="size-10 text-muted-foreground"
            aria-hidden="true"
        />
    );
}
