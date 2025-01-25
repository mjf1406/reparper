import { CENTURY_SKILLS_FONT_SIZE, COMMENT_FONT_SIZE, COVER_PAGE_FONT_SIZE, Grade, GRADE_FORM_URLS, GRADE_WORD_MAP, prefixArray, SEMESTER_WORD_MAP, studentLetters, SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE, TITLE_FONT_SIZE } from "./constants"
import { Data } from "./ProcessData";
import { StudentField } from "./types"
import { PDFDocument, PDFFont } from "pdf-lib";
import fontkit from '@pdf-lib/fontkit'
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
    let semesterAsNumberString = semester.replace("s", "");
    const formUrl = GRADE_FORM_URLS[classGrade];
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    // ---- Add new font-embedding code here ----
    // Adjust the paths or font file names as necessary
    // const calibriFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDlaxbqQtj436hbI2XTiBqMLrt1U7spvEw5ofF').then(r => r.arrayBuffer());
    // const calibriFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDUtK1ttJqKGv0nFogD9kTZmAuMQYhPOtN5exa').then(r => r.arrayBuffer()); // Carlito Regular
    const calibriFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDyRg3H4EsbVR3ALxUmWQezgiYId5G2H9MTPSv').then(r => r.arrayBuffer()); // FiraSans Regular
    const calibriFont = await pdfDoc.embedFont(calibriFontBytes);

    // const calibriBoldFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDQBe79FA3NaDc8h7ylKOFuZfwHr6o1sxzInLm').then(r => r.arrayBuffer());
    // const calibriBoldFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDweXTfBbK5lrsQ7YERgfk0ueXbVCjIztZDG1p').then(r => r.arrayBuffer()); // Carlito Bold
    const calibriBoldFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwD1CcICKzGj4mEaiNZzkFnbyhver0O8ScVfsYp').then(r => r.arrayBuffer()); // FiraSans Bold
    const calibriBoldFont = await pdfDoc.embedFont(calibriBoldFontBytes);

    // const cambriaBoldFontBytes = await fetch('/fonts/cambria-bold.ttf').then(r => r.arrayBuffer());
    const cambriaBoldFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDfwlmA1uCxXVGRnoBmhADsIi58ZgW2ptSTuHe').then(r => r.arrayBuffer());
    const cambriaBoldFont = await pdfDoc.embedFont(cambriaBoldFontBytes);
    // ------------------------------------------

    const form = pdfDoc.getForm();
    
    // const codeField = form.getTextField("Code");
    // codeField.setFontSize(8);
    // codeField.updateAppearances(calibriFont); 

    // Title
    const titleField = form.getTextField('Text15')
    titleField.setText(`Grade ${GRADE_WORD_MAP[classGrade]} - Semester ${SEMESTER_WORD_MAP[semester]} - ${classYear}`)
    titleField.setFontSize(TITLE_FONT_SIZE)
    titleField.updateAppearances(cambriaBoldFont);

    // The Date
    const dateField = form.getTextField('July/feb')
    dateField.setText(formatDate(publishDate))
    dateField.setFontSize(COVER_PAGE_FONT_SIZE)
    dateField.updateAppearances(calibriFont);

    // Teacher's Name
    const teacherNameField = form.getTextField('T:name')
    teacherNameField.setText(teacherName)
    teacherNameField.setFontSize(COVER_PAGE_FONT_SIZE)
    teacherNameField.updateAppearances(calibriFont);

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
                field.updateAppearances(calibriFont)
                field.setFontSize(COMMENT_FONT_SIZE);
            } else { 
                semesterAsNumberString = semester.replace("s", "")
            }

            if (name.includes("_OJ")) {
                continue
                const field = form.getTextField(`${prefix}OJ`);
                field.setFontSize(6);
                field.updateAppearances(calibriFont);
                continue;
            }
            
            // if (prefix === "S Text") continue;
            if (prefix === "Text15") continue
            if (prefix === "July/feb") continue
            if (prefix === "T:name") continue
            
  
            let fieldName = `${prefix}${semesterAsNumberString}${studentLetter}`; // Defaults to 21st Century Skills, Learner Traits, and Work Habits
            if (prefix.includes("Text"))
                fieldName = `${prefix}${studentLetter}${studentLetter}`; // For Subject Achievement Comments
            if (name.includes("_score"))
                fieldName = `${prefix}${semesterAsNumberString}${studentLetter}${studentLetter}`; // For Subject Achievement Comments
            if (prefix === "Student " || prefix === "number ")
                fieldName = `${prefix}${studentLetter}`; // For Student Name and Student Number

            const field = form.getTextField(fieldName);

            if (prefix.includes("_score") || prefixData.json === "student21stCenturySkills" || prefixData.json === "studentSubjectAchievementScores") {
                field.updateAppearances(calibriBoldFont)
                field.setFontSize(CENTURY_SKILLS_FONT_SIZE)
            }
            else if (prefix.includes("Text")) {
                field.updateAppearances(calibriFont)
                field.setFontSize(SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE)
            }
            else if (name === "student_number" || name === "student_name") {
                field.updateAppearances(calibriFont)
                field.setFontSize(COVER_PAGE_FONT_SIZE)
            }

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
                text = text?.replaceAll("\r\n", "\n")
                text = text?.replaceAll("- ", "-")
                text = text?.replaceAll("-", " - ")
                
            } else {
                text = "";
            }
  
            if (text !== undefined) {
                field.setText(text);
            }

            if (semester === "2") {
                if (prefix === "Student " || prefix === "number " || prefix.includes("Text") || prefix === "Skills/Habits ") continue

                const semesterAsNumberStringSemester1 = "1"
                const semString = "s1"
                let fieldNameSemester1 = `${prefix}${semesterAsNumberStringSemester1}${studentLetter}`; // Defaults to 21st Century Skills, Learner Traits, and Work Habits
                if (name.includes("_score"))
                    fieldNameSemester1 = `${prefix}${semesterAsNumberStringSemester1}${studentLetter}${studentLetter}`; // For Subject Achievement Comments

                const fieldSemester1 = form.getTextField(fieldNameSemester1);
                if (prefix.includes("_score") || prefixData.json === "student21stCenturySkills" || prefixData.json === "studentSubjectAchievementScores") {
                    fieldSemester1.updateAppearances(calibriBoldFont)
                    fieldSemester1.setFontSize(CENTURY_SKILLS_FONT_SIZE)
                }

                let textDataSemester1 = studentFields?.[name as keyof StudentField];
                if (name.includes("_score")) {
                    textDataSemester1 = studentFields?.[
                        name.replace("_score", "") as keyof StudentField
                    ] as string;
                }
                let textSemester1;
    
                if (
                    textDataSemester1 &&
                    typeof textDataSemester1 === "object" 
                    && `${semString}` in textDataSemester1
                ) {
                    if (name.includes("_score")) {
                        textSemester1= textDataSemester1[`${semString}` as keyof typeof textDataSemester1] as
                        | string
                        | undefined;
                    } else {
                        textSemester1= textDataSemester1[`${semString}` as keyof typeof textDataSemester1] as
                        | string
                        | undefined;
                    }
                    textSemester1 = textSemester1?.replaceAll("\r\n", "\n")
                    
                } else {
                    textSemester1= "";
                }
    
                if (textSemester1!== undefined) {
                    fieldSemester1.setText(textSemester1);
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