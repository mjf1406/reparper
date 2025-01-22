"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Download, SquarePen, School, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// import EventBus from "@/lib/EventBus";
import Link from "next/link";
import type { StudentField, TeacherCourse } from "@/lib/types";
import removeClassFromTeacher from "@/server/actions/removeClassFromTeacher";
import { useToast } from "../ui/use-toast";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { downloadReportsBySemester } from "@/server/actions/downloadReportsBySemester";
import { PDFDocument } from "pdf-lib";
import { GRADE_FORM_URLS, type Grade } from "@/lib/constants";

async function fetchClassroomData(): Promise<TeacherCourse[]> {
    try {
        const response = await fetch("/api/getClasses");
        if (!response.ok) {
            throw new Error("Failed to fetch classes data");
        }
        const text: string = await response.text(); // Make this operation await so it completes here
        const data: TeacherCourse[] = JSON.parse(text) as TeacherCourse[];
        return data;
    } catch (err) {
        const error = err as Error;
        console.error("failed to parse course", error);
        throw new Error("failed to parse course");
    }
}

export type PDF = {
    student_name: string;
    student_number: string;
    student_fields: StudentField;
    [key: string]: string | StudentField;
};

// https://pdf-lib.js.org/#fill-form
export async function printPDF(
    data: PDF[],
    semester: string,
    sex: string,
    className: string,
    classYear: string,
    classGrade: Grade
) {
    const studentLetters: string[] = [
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
    ];
    const prefixArray = [
        // Reading OJ
        // the below just use the student letter
        // e.g. if it's student b, then it would be
        // Student b
        { name: "student_name", prefix: "Student " },
        { name: "student_number", prefix: "number " },
        // --- 21st Century Skills, Learner Traits, and Work Habits ---
        // the below use the letter once and the semester number
        // e.g. if the semester is 1 for student b, then it would be
        // Res1b
        { name: "responsibility", prefix: "Res" },
        { name: "organization", prefix: "Or" },
        { name: "collaboration", prefix: "co" },
        { name: "communication", prefix: "Com" },
        { name: "thinking", prefix: "thin" },
        { name: "inquiry", prefix: "inqu" },
        { name: "risk_taking", prefix: "ref" },
        { name: "open_minded", prefix: "rt" },
        // --- Skill and Habits Comment ---
        // the below uses the semester number then the letter once
        // e.g. if the semester is 1 and the letter is b
        // Skills/Habits 1b
        { name: "comment", prefix: "Skills/Habits " },
        // --- Subject Achievement Scores ---
        // the below uses the semester number then the letter twice
        // e.g. if the letter is b, then it would be
        // R1bb (name + semester + letter + letter)
        { name: "reading_score", prefix: "R" },
        { name: "writing_score", prefix: "W" },
        { name: "speaking_score", prefix: "Sp" },
        { name: "listening_score", prefix: "L" },
        { name: "use_of_english_score", prefix: "UE" },
        { name: "mathematics_score", prefix: "M" },
        { name: "social_studies_score", prefix: "SS" },
        { name: "science_score", prefix: "SC" },
        // --- Subject Achievement Comments ---
        // the below use the letter twice
        // e.g. if the letter is b, then it would be
        // Reading Textbb
        // These are the fields for the Strengths/Next Steps for Improvements, i.e. the subject comments
        { name: "reading", prefix: "Reading Text" },
        { name: "writing", prefix: "Writing Text" },
        { name: "speaking", prefix: "Speaking Text" },
        { name: "listening", prefix: "Listening Text" },
        { name: "use_of_english", prefix: "Use of English Text" },
        { name: "mathematics", prefix: "math Text" },
        { name: "social_studies", prefix: "S.S Text" },
        { name: "science", prefix: "SciText" },
        // --- Subject Achievement Descriptions
        // The descriptions of each subject follows the subject + OJ
        // e.g. if the subject is reading, then it would be
        { name: "reading_OJ", prefix: "Reading " },
        { name: "writing_OJ", prefix: "Writing " },
        { name: "speaking_OJ", prefix: "Speaking " },
        { name: "listening_OJ", prefix: "listening " },
        { name: "use_of_english_OJ", prefix: "use of Eng" },
        { name: "mathematics_OJ", prefix: "math " },
        { name: "social_studies_OJ", prefix: "SS " },
        { name: "science_OJ", prefix: "Sci " },
    ];
    let semesterAsNumberString = semester.replace("s", "");
    const formUrl = GRADE_FORM_URLS[classGrade];
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();
    // const fields = form.getFields();
    // const formFields = fields.map((field) => {
    //   return {
    //     name: field.getName(),
    //     type: field.constructor.name, // or you can use field.getType() if available
    //     // value: field.getValue(), // you can also add any other properties you need
    //   };
    // });
    // function getCircularReplacer() {
    //   const seen = new WeakSet();
    //   return (key, value) => {
    //     if (typeof value === "object" && value !== null) {
    //       if (seen.has(value)) {
    //         return;
    //       }
    //       seen.add(value);
    //     }
    //     return value;
    //   };
    // }
    // const formFieldsJson = JSON.stringify(formFields, null, 2);
    // const bloba = new Blob([formFieldsJson], { type: "application/json" });
    // const linka = document.createElement("a");
    // linka.href = window.URL.createObjectURL(bloba);
    // linka.download = `formFields.json`;
    // linka.click();
    // window.URL.revokeObjectURL(linka.href);

    const codeField = form.getTextField("Code");
    codeField.setFontSize(8);

    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const studentFields = element?.student_fields;
        const studentLetter = studentLetters[index];
        for (const prefixData of prefixArray) {
            const name = prefixData?.name;
            const prefix = prefixData?.prefix;

            if (name === "comment") {
                semesterAsNumberString = "1";
                const field = form.getTextField(
                    `${prefix}${semesterAsNumberString}${studentLetter}`
                );
                field.setFontSize(6);
            } else semesterAsNumberString = semester.replace("s", "");
            if (name.includes("_OJ")) {
                const field = form.getTextField(`${prefix}OJ`);
                field.setFontSize(6);
                continue;
            }
            // if (prefix === "S Text") continue;

            let fieldName = `${prefix}${semesterAsNumberString}${studentLetter}`; // Defaults to 21st Century Skills, Learner Traits, and Work Habits
            if (prefix.includes("Text"))
                fieldName = `${prefix}${studentLetter}${studentLetter}`; // For Subject Achievement Comments
            if (name.includes("_score"))
                fieldName = `${prefix}${semesterAsNumberString}${studentLetter}${studentLetter}`; // For Subject Achievement Comments
            if (prefix === "Student " || prefix === "number ")
                fieldName = `${prefix}${studentLetter}`; // For Student Name and Student Number
            const field = form.getTextField(fieldName);

            let textData = studentFields?.[name as keyof StudentField];
            if (prefix === "Student " || prefix === "number ")
                textData = element?.[name as keyof PDF] as string | undefined;
            if (name.includes("_score")) {
                textData = studentFields?.[
                    name.replace("_score", "") as keyof StudentField
                ] as string;
            }
            let text;

            if (typeof textData === "string" || textData instanceof String) {
                text = textData as string;
            } else if (
                textData &&
                typeof textData === "object" &&
                semester in textData
            ) {
                if (name.includes("_score"))
                    text = textData[semester as keyof typeof textData] as
                        | string
                        | undefined;
                else if (prefix.includes("Text"))
                    text = textData[
                        `${semester}_comment` as keyof typeof textData
                    ] as string | undefined;
                else
                    text = textData[semester as keyof typeof textData] as
                        | string
                        | undefined;
            } else {
                text = "";
            }

            if (text !== undefined) {
                field.setText(text);
            }
        }
    }

    // form.flatten();
    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `(${classYear}) ${className}-${semester}-${sex}.pdf`;
    link.click();
    window.URL.revokeObjectURL(link.href);
}

export default function ClassList() {
    const [courses, setCourses] = useState<TeacherCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingNewUser, setIsLoadingNewUser] = useState(false);
    const [pdfLoadingS1, setPdfLoadingS1] = useState(false);
    const [pdfLoadingS2, setPdfLoadingS2] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [deleteCourseText, setDeleteCourseText] = useState("");
    const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);
    const { toast } = useToast();

    async function buildPdfReportBySemester(
        classId: string,
        semester: string,
        className: string,
        classYear: string,
        classGrade: Grade
    ) {
        if (semester === "s1") setPdfLoadingS1(true);
        if (semester === "s2") setPdfLoadingS2(true);
        toast({
            title: "Pulling data from the server...",
            description: "We thank you for your patience.",
        });
        const data = await downloadReportsBySemester(classId, semester);
        toast({
            title: "Building the boy PDF...",
            description: "We thank you for your patience.",
        });
        await printPDF(
            data.males,
            semester,
            "boys",
            className,
            classYear,
            classGrade
        );
        toast({
            title: "Building the girl PDF...",
            description: "We thank you for your patience.",
        });
        await printPDF(
            data.females,
            semester,
            "girls",
            className,
            classYear,
            classGrade
        );
        if (semester === "s1") setPdfLoadingS1(false);
        if (semester === "s2") setPdfLoadingS2(false);
        toast({
            title: "All done!",
            description: "Thank you for your patience! :D",
            duration: 2000,
        });
    }
    // async function buildPdfReportBySemester(
    //   classId: string,
    //   semester: string,
    //   className: string,
    //   classYear: string,
    //   classGrade: Grade,
    // ) {
    //   if (semester === "s1") setPdfLoadingS1(true);
    //   if (semester === "s2") setPdfLoadingS2(true);

    //   try {
    //     toast({
    //       title: "Generating PDF...",
    //       description: "Please wait while we generate your PDF.",
    //     });

    //     const generatePDF = async (sex: "males" | "females") => {
    //       const response = await fetch("/api/generatePDF", {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //           classId,
    //           semester,
    //           className,
    //           classYear,
    //           classGrade,
    //           sex,
    //         }),
    //       });

    //       if (!response.ok) {
    //         throw new Error(`Failed to generate PDF for ${sex}`);
    //       }

    //       const blob = await response.blob();
    //       const url = window.URL.createObjectURL(blob);
    //       const a = document.createElement("a");
    //       a.href = url;
    //       a.download = `${className}-${semester}-${sex === "males" ? "boys" : "girls"}.pdf`;
    //       document.body.appendChild(a);
    //       a.click();
    //       window.URL.revokeObjectURL(url);
    //     };

    //     await generatePDF("males");
    //     await generatePDF("females");

    //     toast({
    //       title: "PDFs generated successfully!",
    //       description: "Your PDFs have been downloaded.",
    //     });
    //   } catch (error) {
    //     console.error("Error generating PDF:", error);
    //     toast({
    //       title: "Error generating PDFs",
    //       description:
    //         "An error occurred while generating the PDFs. Please try again.",
    //       variant: "destructive",
    //     });
    //   } finally {
    //     if (semester === "s1") setPdfLoadingS1(false);
    //     if (semester === "s2") setPdfLoadingS2(false);
    //   }
    // }
    async function handleDeleteClass(classId: string, className: string) {
        if (className !== deleteCourseText) {
            return toast({
                title: "Class names do not match!",
                description:
                    "This is case-sensitive. Please double check what you typed and try again.",
                variant: "destructive",
            });
        }
        try {
            setLoadingButtonId(`delete-${classId}`);
            await removeClassFromTeacher(classId);
            setCourses(courses.filter((course) => course.class_id !== classId)); // remove the class from the list
            toast({
                title: "Class deleted successfully!",
                description: `${className} has been successfully deleted.`,
            });
        } catch (error) {
            toast({
                title: "Failed to delete class!",
                description: "Please try again in a moment.",
                variant: "destructive",
            });
        }
    }

    const handleMyClassesClick = (id: string) => {
        setLoadingButtonId(id);
    };

    useEffect(() => {
        fetchClassroomData()
            .then((data) => {
                setCourses(data);
                setIsLoading(false);
            })
            .catch((error) => {
                const err = error as Error;
                console.error("failed to fetch classes data", err);
                throw new Error("failed to fetch classes", err);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5">
                <div className="rounded-xl bg-foreground/5 p-5">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading classes...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="m-auto flex w-full max-w-3xl flex-col gap-4">
            {courses.length === 0 ? (
                <div className="flex flex-col gap-5">
                    <div className="rounded-xl bg-foreground/5 p-5">
                        <div className="flex items-center justify-center gap-2">
                            <div>Add a class by clicking the button above.</div>
                        </div>
                    </div>
                </div>
            ) : (
                courses.map((course) => (
                    <div
                        key={course.class_id}
                        className="m-auto flex w-full gap-10 rounded-2xl bg-card-foreground/10 p-3"
                    >
                        <div className="flex flex-1 flex-col justify-center self-start">
                            <div className="text-base font-bold lg:text-xl">
                                {`${course.class_name} (${course.class_year})`}
                            </div>
                            <div className="text-sm italic lg:text-sm">
                                {course.role} teacher
                            </div>
                            <div className="text-sm italic">
                                grade {course.class_grade}
                            </div>
                        </div>
                        <div className="m-auto flex h-full flex-1 items-end justify-end gap-2 self-end">
                            {course.complete.s1 || course.complete.s2 ? (
                                <>
                                    {course.complete.s1 && (
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                buildPdfReportBySemester(
                                                    course.class_id,
                                                    "s1",
                                                    course.class_name,
                                                    course.class_year,
                                                    course.class_grade as Grade
                                                )
                                            }
                                            disabled={pdfLoadingS1}
                                        >
                                            {pdfLoadingS1 ? (
                                                <>
                                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                    S1
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    S1
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {course.complete.s2 && (
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                buildPdfReportBySemester(
                                                    course.class_id,
                                                    "s2",
                                                    course.class_name,
                                                    course.class_year,
                                                    course.class_grade as Grade
                                                )
                                            }
                                            disabled={pdfLoadingS2}
                                        >
                                            {pdfLoadingS2 ? (
                                                <>
                                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                    S2
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    S2
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <></>
                            )}
                            {loadingButtonId === `open-${course.class_id}` ? (
                                <Button
                                    key={`open-${course.class_id}`}
                                    variant={"outline"}
                                    disabled
                                >
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    Open
                                </Button>
                            ) : (
                                <Button
                                    key={`open-${course.class_id}`}
                                    asChild
                                    variant={"outline"}
                                    onClick={() =>
                                        handleMyClassesClick(
                                            `open-${course.class_id}`
                                        )
                                    }
                                >
                                    <Link
                                        href={{
                                            pathname: `/classes/${course.class_id}`,
                                            query: {
                                                class_name: course?.class_name,
                                            },
                                        }}
                                    >
                                        <School className="mr-2 h-4 w-4" />
                                        Open
                                    </Link>
                                </Button>
                            )}
                            <Button
                                asChild
                                variant={"ghost"}
                                className="bg-inherit px-2 py-1"
                            >
                                <Link href={`/classes/${course.class_id}/edit`}>
                                    <SquarePen className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant={"destructive"}
                                        className=" px-2 py-1"
                                        onClick={() =>
                                            setCourseToDelete(course.class_name)
                                        }
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Delete class</DialogTitle>
                                        <DialogDescription>
                                            Please type the class name,{" "}
                                            <span
                                                id="class-id"
                                                className="font-bold"
                                            >
                                                {courseToDelete}
                                            </span>
                                            , below in order to confirm
                                            deletion. Deleting a class is{" "}
                                            <b>IRREVERSIBLE</b>.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex items-center space-x-2">
                                        <div className="grid flex-1 gap-2">
                                            <Label
                                                htmlFor="link"
                                                className="sr-only"
                                            >
                                                Class to delete
                                            </Label>
                                            <Input
                                                id="class-to-delete"
                                                value={deleteCourseText}
                                                onChange={(e) =>
                                                    setDeleteCourseText(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="sm:justify-start">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        {loadingButtonId ===
                                        `delete-${course.class_id}` ? (
                                            <Button
                                                key={`delete-${course.class_id}`}
                                                variant={"destructive"}
                                                disabled
                                            >
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                Deleting...
                                            </Button>
                                        ) : (
                                            <Button
                                                key={`delete-${course.class_id}`}
                                                onClick={() =>
                                                    handleDeleteClass(
                                                        course.class_id,
                                                        course.class_name
                                                    )
                                                }
                                                variant={"destructive"}
                                            >
                                                Delete class
                                            </Button>
                                        )}
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
