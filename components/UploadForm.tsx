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

/**
 * The FileUploader component
 */
import { FileUploader } from "./ui/file-uploader";
import { processData, splitByGender, transformToPDF } from "@/lib/ProcessData";
import Image from "next/image";
import { PDF, printPDF } from "@/lib/generatePDF";
import { Grade } from "@/lib/constants";
import { Data } from "@/lib/types";

/**
 * Define a zod schema for your dialog form.
 * Adjust the schema as needed for your real validation requirements.
 */
const formSchema = z.object({
    date: z.string().nonempty("Please select a date."),
    name: z.string().min(1, "Please enter a name."),
    grade: z.string().min(1, "Please select a grade."),
    classNumber: z.string().min(1, "Please select a class number."),
    semester: z.string().min(1, "Please select a semester."),
    academicYearStart: z
        .string()
        .min(1, "Please select an academic year start."), // Add this line
});

type FormValues = z.infer<typeof formSchema>;

export default function FileUploadForm() {
    const [files, setFiles] = React.useState<File[] | undefined>(undefined);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [data, setData] = React.useState<unknown>();
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState("Processing...");
    const [loadingImage, setLoadingImage] = React.useState(
        "/path/to/default/image.png"
    );

    const currentYear = new Date().getFullYear();
    const academicYearOptions = [currentYear - 1, currentYear, currentYear + 1];

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

    async function validateAndProcessXLSX(files: File[]) {
        if (files.length === 0) {
            toast.error("No file uploaded!");
            return;
        }

        const file = files[0];

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (data) {
                const sheetsData = processData(data as string);
                setData(sheetsData);
                setOpenDialog(true);
            }
        };

        reader.onerror = () => {
            toast.error("Error reading the file!");
        };

        reader.readAsBinaryString(file);
    }

    async function handleSubmit(files: File[]) {
        console.log(files);
    }

    async function onDialogSubmit(values: FormValues) {
        const startTime = new Date();
        const classNumber = values.classNumber;
        const date = values.date;
        const grade = values.grade;
        const name = values.name;
        const semester = values.semester;
        const academicYearStart = values.academicYearStart;

        try {
            setIsLoading(true);
            setLoadingMessage("Getting the data ready!");
            setLoadingImage("/images/tired-monkey-teacher.png");

            const { females, males } = splitByGender(data as unknown as Data);
            const femalePDFs: PDF[] = transformToPDF(females);
            const malePDFs: PDF[] = transformToPDF(males);
            await new Promise((resolve) => setTimeout(resolve, 3000));

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
                name
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));

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
                name
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setLoadingMessage("All done!");
            setLoadingImage("/images/happy-monkey-teacher.png");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setOpenDialog(false);
        } catch (error) {
            console.error(error);
            setLoadingMessage("Submission failed. Please try again.");
            setLoadingImage("/path/to/error/image.png");
        } finally {
            setIsLoading(false);

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

    return (
        <>
            <form className="flex flex-col gap-4 max-w-xl mx-auto">
                <FileUploader
                    accept={{
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                            [],
                    }}
                    maxFileCount={1}
                    multiple={false}
                    value={files}
                    onValueChange={(files) => {
                        setFiles(files);
                    }}
                    onUpload={async (files) => {
                        await validateAndProcessXLSX(files);
                        await handleSubmit(files);
                    }}
                />
            </form>

            {files && files.length > 0 && (
                <div className="flex justify-center mt-4">
                    <Button
                        size={"lg"}
                        onClick={() => setOpenDialog(true)}
                    >
                        Submit additional info
                    </Button>
                </div>
            )}

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
                                            This is the date that the report
                                            cards will be given to the students.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                            This is the name that will appear on
                                            each report card (e.g. Mr.
                                            Fitzgerald).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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

                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4">
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
                            <div className="flex flex-col justify-center items-center gap-3">
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
