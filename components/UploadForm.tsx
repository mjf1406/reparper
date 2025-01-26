"use client";

import * as React from "react";
import { toast } from "sonner";

// Shadcn UI components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

// Shadcn Form components
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";

// React Hook Form + Zod
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Local imports
import Image from "next/image";
import { processData, splitByGender, transformToPDF } from "@/lib/ProcessData";
import { PDF, printPDF } from "@/lib/generatePDF";
import { Grade } from "@/lib/constants";
import { Data } from "@/lib/types";

// Example FileUploader from your snippet
import { FileUploader } from "./ui/file-uploader";

/**
 * Zod schema for the additional form data in the dialog.
 * Adjust fields & validations as needed.
 */
const formSchema = z.object({
    date: z.string().nonempty("Please select a date."),
    name: z.string().min(1, "Please enter a name."),
    grade: z.string().min(1, "Please select a grade."),
    classNumber: z.string().min(1, "Please select a class number."),
    semester: z.string().min(1, "Please select a semester."),
    academicYearStart: z
        .string()
        .min(1, "Please select an academic year start."),
});

type FormValues = z.infer<typeof formSchema>;

export default function FileUploadForm() {
    // State for the two uploaded files
    const [files, setFiles] = React.useState<File[]>([]);

    // State for whether the dialog is open
    const [openDialog, setOpenDialog] = React.useState(false);

    // XLSX data from your custom parse function
    const [data, setData] = React.useState<Data | undefined>(undefined);

    // Loading states
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState("Processing...");
    const [loadingImage, setLoadingImage] = React.useState(
        "/path/to/default/image.png"
    );
    const [uploadedPdfBytes, setUploadedPdfBytes] =
        React.useState<Uint8Array | null>(null);

    // Build academic year dropdown from the current year
    const currentYear = new Date().getFullYear();
    const academicYearOptions = [currentYear - 1, currentYear, currentYear + 1];

    // React Hook Form setup
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: "",
            name: "",
            grade: "",
            classNumber: "",
            semester: "",
            academicYearStart: "",
        },
    });

    /**
     * We only parse XLSX after it has successfully passed validations.
     */
    function parseXLSXFile(file: File) {
        return new Promise<Data>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target?.result;
                if (!fileContent) {
                    return reject(new Error("File read error - empty result."));
                }
                try {
                    const sheetsData = processData(fileContent as string);
                    resolve(sheetsData as unknown as Data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => {
                reject(new Error("Error reading the XLSX file."));
            };
            reader.readAsBinaryString(file);
        });
    }

    /**
     * Once both files pass validation in <FileUploader>,
     * we parse the XLSX and only then open the dialog if both XLSX & PDF are found.
     */
    async function onAllFilesValidated(uploadedFiles: File[]) {
        try {
            // Check for exactly one XLSX file
            const xlsxFile = uploadedFiles.find((f) =>
                f.type.includes("spreadsheetml")
            );
            if (!xlsxFile) {
                throw new Error(
                    "No XLSX file found. Please upload a valid XLSX file."
                );
            }

            // Check for exactly one PDF file
            const pdfFile = uploadedFiles.find(
                (f) => f.type === "application/pdf"
            );
            if (!pdfFile) {
                throw new Error(
                    "No PDF file found. Please upload a valid PDF file."
                );
            }

            // Parse the XLSX for data
            const extractedData = await parseXLSXFile(xlsxFile);
            setData(extractedData);
            // Read the PDF file as ArrayBuffer
            const pdfBytes = await readFileAsArrayBuffer(pdfFile);
            setUploadedPdfBytes(new Uint8Array(pdfBytes));

            // Once we have valid XLSX data and we know a PDF is present,
            // open the dialog to collect additional info.
            setOpenDialog(true);
        } catch (err) {
            console.error(err);
            toast.error(String(err));
        }
    }
    /**
     * Utility function to read a file as ArrayBuffer
     */
    function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    resolve(reader.result as ArrayBuffer);
                } else {
                    reject(new Error("Failed to read file."));
                }
            };
            reader.onerror = () => {
                reject(new Error("Error reading file."));
            };
            reader.readAsArrayBuffer(file);
        });
    }
    /**
     * Handler for the final submission of the dialog data.
     */
    async function onDialogSubmit(values: FormValues) {
        const startTime = new Date();
        const { date, name, grade, classNumber, semester, academicYearStart } =
            values;

        try {
            setIsLoading(true);
            setLoadingMessage("Getting the data ready!");
            setLoadingImage("/images/tired-monkey-teacher.png");

            if (!data) {
                throw new Error(
                    "No data to process — did you upload the correct file?"
                );
            }

            if (!uploadedPdfBytes) {
                throw new Error("No PDF template uploaded.");
            }

            // Prepare & print the PDFs
            const { females, males } = splitByGender(data);
            const femalePDFs: PDF[] = transformToPDF(females);
            const malePDFs: PDF[] = transformToPDF(males);

            // "Simulate" some asynchronous progress
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Generate the PDF for females
            setLoadingMessage("Generating girl PDF!");
            setLoadingImage("/images/girl-monkey-working.png");
            await printPDF(
                femalePDFs,
                semester,
                "girls",
                `${grade}-${classNumber}`,
                academicYearStart,
                grade as Grade,
                date,
                name,
                uploadedPdfBytes
            );

            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Generate the PDF for males
            setLoadingMessage("Generating boy PDF!");
            setLoadingImage("/images/boy-monkey-working.png");
            await printPDF(
                malePDFs,
                semester,
                "boys",
                `${grade}-${classNumber}`,
                academicYearStart,
                grade as Grade,
                date,
                name,
                uploadedPdfBytes
            );

            await new Promise((resolve) => setTimeout(resolve, 1000));

            // All done
            setLoadingMessage("All done!");
            setLoadingImage("/images/happy-monkey-teacher.png");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Close the dialog
            setOpenDialog(false);
        } catch (error) {
            console.error(error);
            setIsLoading(true);
            setLoadingMessage(
                "An error occurred while generating the PDFs. Check to make sure the files you uploaded are correct."
            );
            setLoadingImage("/images/error-monkey.png");
            toast.error(
                "An error occurred while generating the PDFs. Check to make sure the files you uploaded are correct."
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
            setIsLoading(false);
        } finally {
            setIsLoading(false);

            // Just measuring how long everything took
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            const minutes = Math.floor(duration / 60000);
            const seconds = ((duration % 60000) / 1000).toFixed(3);

            if (minutes > 0) {
                console.log(`${minutes}m ${seconds}s`);
            } else {
                console.log(`${seconds}s`);
            }
        }
    }

    // Decide whether or not to show "Submit additional information" button
    const isXlsx = files.some((f) => f.type.includes("spreadsheetml"));
    const isPdf = files.some((f) => f.type === "application/pdf");
    const showDialogButton = isXlsx && isPdf && data;

    return (
        <>
            {/**
             * Our FileUploader ensures:
             *   - Exactly one XLSX w/ "Reparper Template"
             *   - Exactly one PDF matching `[1-6]-[1-4] S[1-2] (Boys|Girls) YYYY-YY`
             *   - Only 2 files total
             */}
            <form className="mx-auto flex max-w-xl flex-col gap-4">
                <FileUploader
                    // Accept XLSX and PDF only
                    accept={{
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                            [],
                        "application/pdf": [],
                    }}
                    // Max 2 files
                    maxFileCount={2}
                    multiple={true}
                    // Pass the files into parent state
                    value={files}
                    onValueChange={(uploaded) => {
                        setFiles(uploaded);
                    }}
                    // onUpload is only called if both files pass validation
                    onUpload={async (uploadedFiles) => {
                        // Once validated, parse XLSX and (only then) show dialog
                        await onAllFilesValidated(uploadedFiles);
                    }}
                />
            </form>

            {/**
             * 2) Show the button only if:
             *    - The XLSX is parsed into `data` (meaning it was successfully read).
             *    - We still have exactly one XLSX and one PDF in `files`.
             *    If either file is removed, the button goes away.
             */}
            {showDialogButton && (
                <div className="mt-4 flex justify-center">
                    <Button onClick={() => setOpenDialog(true)}>
                        Submit additional information
                    </Button>
                </div>
            )}

            {/**
             * 3) The <Dialog> is opened immediately after files are validated
             *    or via the button above.
             */}
            <Dialog
                open={openDialog}
                onOpenChange={setOpenDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Additional Information</DialogTitle>
                        <DialogDescription>
                            Please provide the following details
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onDialogSubmit)}
                            className="space-y-4"
                        >
                            {/* Date */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The date that the report cards will
                                            be given to the students.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Your name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The name that will appear on each
                                            report card (e.g. Mr. Fitzgerald).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Grade */}
                            <FormField
                                control={form.control}
                                name="grade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Grade</FormLabel>
                                        <FormControl>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select grade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5
                                                    </SelectItem>
                                                    <SelectItem value="6">
                                                        6
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Class Number */}
                            <FormField
                                control={form.control}
                                name="classNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class Number</FormLabel>
                                        <FormControl>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select class number" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Semester */}
                            <FormField
                                control={form.control}
                                name="semester"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Semester</FormLabel>
                                        <FormControl>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select semester" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Academic Year Start */}
                            <FormField
                                control={form.control}
                                name="academicYearStart"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Academic Year Start
                                        </FormLabel>
                                        <FormControl>
                                            <Select
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select academic year start" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYearOptions.map(
                                                        (year) => (
                                                            <SelectItem
                                                                key={year}
                                                                value={year.toString()}
                                                            >
                                                                {year}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    Submit
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>

                    {/* Loading overlay while generating PDFs */}
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80">
                            <Image
                                src={loadingImage}
                                alt="Loading"
                                className="animate-bounce"
                                width={300}
                                height={300}
                            />
                            <p className="text-3xl font-semibold">
                                {loadingMessage}
                            </p>
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="mx-auto w-full text-center">
                                    This shouldn&apos;t take more than a
                                    minute—hang in there!
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
