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
import { processData } from "@/lib/ProcessData";

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
});

type FormValues = z.infer<typeof formSchema>;

export default function FileUploadForm() {
    const [files, setFiles] = React.useState<File[] | undefined>(undefined);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [data, setData] = React.useState<unknown>();
    console.log("🚀 ~ FileUploadForm ~ data:", data);

    // Initialize the form using react-hook-form and zod
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: "",
            name: "",
            grade: "",
            classNumber: "",
            semester: "",
        },
    });

    /**
     * Placeholder function: run any validation or data processing here
     * when files are uploaded.
     */
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

    /**
     * This would be your "submit" flow— run automatically after a successful upload.
     */
    async function handleSubmit(files: File[]) {
        // Here you could make an API call, etc.
        console.log(files);
        toast.success("Form submitted automatically after XLSX validation!");
    }

    /**
     * Handle the final form submission inside the dialog.
     */
    function onDialogSubmit(values: FormValues) {
        console.log("Dialog form submitted with:", values);
        // Close dialog
        setOpenDialog(false);
        // Optionally, do more with `values` here.
    }

    return (
        <>
            {/* File Upload Form */}
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

            {/* Shadcn Dialog with a Form inside */}
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

                    {/* Use the shadcn <Form> component with react-hook-form */}
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
                                            This is the date that the report
                                            cards will be given to the students.
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
                                            This is the name that will appear on
                                            each report card (e.g. Mr.
                                            Fitzgerald).
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

                            <DialogFooter>
                                <Button type="submit">Submit</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
