import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Grade, GRADE_FORM_URLS } from "./constants"
import { StudentField } from "./types"
import { PDFDocument } from "pdf-lib";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number
    sizeType?: "accurate" | "normal"
  } = {}
) {
  const { decimals = 0, sizeType = "normal" } = opts

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"]
  if (bytes === 0) return "0 Byte"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytes")
      : (sizes[i] ?? "Bytes")
  }`
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
              textData = element?.[name as keyof PDF] as string;
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

// await printPDF(
//   data.males,
//   semester,
//   "boys",
//   className,
//   classYear,
//   classGrade
// );