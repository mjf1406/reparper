"use client";

import * as React from "react";
import { toast } from "sonner";

/**
 * Import the FileUploader from wherever you placed the code above.
 */
import { FileUploader } from "./ui/file-uploader";

export default function FileUploadForm() {
    const [files, setFiles] = React.useState<File[] | undefined>(undefined);

    /**
     * Placeholder function: run any validation or data processing here
     * when files are uploaded.
     */
    async function validateAndProcessXLSX(files: File[]) {
        // --------------------------------------------------------------
        // YOUR XLSX VALIDATION LOGIC HERE
        // For example, parse with a library like SheetJS:
        //   import * as XLSX from "xlsx";
        //   const workbook = XLSX.read(await files[0].arrayBuffer(), { type: "array" });
        //   const firstSheetName = workbook.SheetNames[0];
        //   const worksheet = workbook.Sheets[firstSheetName];
        //   // ... validate shape, columns, etc.
        //
        // If invalid:
        //   throw new Error("Invalid XLSX format. Please check your template.");
        // --------------------------------------------------------------

        // For now, we simply "validate" by returning success after a small delay:
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(files);
        toast.success("XLSX file validated successfully! (Placeholder)");
    }

    /**
     * This would be your "submit" flow— run automatically after a successful upload.
     */
    async function handleSubmit(files: File[]) {
        // Here you could make an API call, trigger a Next.js route action, etc.
        // For demonstration, we just show another toast.
        console.log(files);
        toast.success("Form submitted automatically after XLSX validation!");
    }

    return (
        // Because we no longer need a manual button, onSubmit is unused
        <form className="flex flex-col gap-4 max-w-xl mx-auto">
            <FileUploader
                /**
                 * Restrict to XLSX files:
                 * "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                 */
                accept={{
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                        [],
                }}
                maxFileCount={1}
                multiple={false}
                value={files}
                onValueChange={(files) => {
                    // Update local state whenever the user picks/removes files
                    setFiles(files);
                }}
                onUpload={async (files) => {
                    /**
                     * This callback is invoked once the dropped file(s) pass Dropzone checks
                     * (e.g., file type). We’ll:
                     * 1) Validate the file’s shape/columns, etc. (placeholder).
                     * 2) Automatically “submit” the form or handle final logic.
                     */
                    await validateAndProcessXLSX(files);
                    await handleSubmit(files);
                }}
            />
        </form>
    );
}
