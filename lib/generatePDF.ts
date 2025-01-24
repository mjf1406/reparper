import { Grade, GRADE_FORM_URLS, GRADE_WORD_MAP, prefixArray, SEMESTER_WORD_MAP, studentLetters } from "./constants"
import { Data } from "./ProcessData";
import { StudentField } from "./types"
import { PDFDocument } from "pdf-lib";
import { formatDate } from "./utils";

export type PDF = {
    student_name: string;
    student_number: string;
    student_fields: StudentField;
    [key: string]: string | StudentField;
};
  
// https://pdf-lib.js.org/#fill-form
export async function printPDF(
    data: Data,
    semester: string,
    sex: string,
    className: string,
    classYear: string,
    classGrade: Grade,
    publishDate: string,
    teacherName: string,
  ) {
      console.log("🚀 ~ semester:", semester)
      
    let semesterAsNumberString = semester.replace("s", "");
    const formUrl = GRADE_FORM_URLS[classGrade];
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();
    
    const codeField = form.getTextField("Code");
    codeField.setFontSize(8);

    // Grade Five - Semester One - 2024
    const titleField = form.getTextField('Text15')
    titleField.setText(`Grade ${GRADE_WORD_MAP[classGrade]} - Semester ${SEMESTER_WORD_MAP[semester]} - ${classYear}`)

    // The Date
    const dateField = form.getTextField('July/feb')
    dateField.setText(formatDate(publishDate))

    // Teacher's Name
    const teacherNameField = form.getTextField('T:name')
    teacherNameField.setText(teacherName)

    console.log("🚀 ~ data:", data)
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
            } else { 
                semesterAsNumberString = semester.replace("s", "")
            }

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
                textData = element?.[name as keyof PDF] as string;
            if (name.includes("_score")) {
                textData = studentFields?.[
                    name.replace("_score", "") as keyof StudentField
                ] as string;
            }
            let text;
  
            if (typeof textData === "string" || textData instanceof String) {
                if (prefix === "number ") {
                    text = `${className.replaceAll("-", "")}${String(textData).padStart(2, '0')}`;
                } else {
                    text = textData as string;
                }
            } else if (
                textData &&
                typeof textData === "object" 
                && `s${semester}` in textData
            ) {
                if (name.includes("_score")) {
                    text = textData[`s${semester}` as keyof typeof textData] as
                    | string
                    | undefined;
                } else if (prefix.includes("Text")) {
                    text = textData[
                        `${`s${semester}`}_comment` as keyof typeof textData
                    ] as string | undefined;
                } else {
                    text = textData[`s${semester}` as keyof typeof textData] as
                        | string
                        | undefined;
                }
            } else {
                text = "";
            }
  
            if (text !== undefined) {
                field.setText(text);
            }

            if (semester === "2") {
                if (prefix === "Student " || prefix === "number " || prefix.includes("Text")) continue
                semesterAsNumberString = "1"
                const semString = "s1"
                let fieldName = `${prefix}${semesterAsNumberString}${studentLetter}`; // Defaults to 21st Century Skills, Learner Traits, and Work Habits
                if (name.includes("_score"))
                    fieldName = `${prefix}${semesterAsNumberString}${studentLetter}${studentLetter}`; // For Subject Achievement Comments

                const field = form.getTextField(fieldName);
    
                let textData = studentFields?.[name as keyof StudentField];
                if (name.includes("_score")) {
                    textData = studentFields?.[
                        name.replace("_score", "") as keyof StudentField
                    ] as string;
                }
                let text;
    
                if (
                    textData &&
                    typeof textData === "object" 
                    && `${semString}` in textData
                ) {
                    if (name.includes("_score")) {
                        text = textData[`${semString}` as keyof typeof textData] as
                        | string
                        | undefined;
                    } else if (prefix.includes("Text")) {
                        text = textData[
                            `${semString}_comment` as keyof typeof textData
                        ] as string | undefined;
                    } else {
                        text = textData[`${semString}` as keyof typeof textData] as
                            | string
                            | undefined;
                    }
                } else {
                    text = "";
                }
    
                if (text !== undefined) {
                    field.setText(text);
                }
            }
        }
    }
  
    // form.flatten();

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${className} S${semester} ${sex.charAt(0).toUpperCase() + sex.slice(1)} ${classYear}-${String(parseInt(classYear) + 1).slice(2)}.pdf`;
    link.click();
    window.URL.revokeObjectURL(link.href);
}