// processXLSXData.ts
import * as XLSX from "xlsx";
import { PDF } from "./generatePDF";
import { Comments, StudentField } from "./types";

export interface SheetData {
    [sheetName: string]: unknown;
}

export interface CommentData {
    [level: string]: {
        [subject: string]: {
            [semester: string]: string;
        };
    };
}

export function processData(data: string): SheetData {
    const workbook = XLSX.read(data, { type: "binary" });
    const sheetsData: SheetData = {};

    for (let index = 0; index < workbook.SheetNames.length; index++) {
        const sheetName = workbook.SheetNames[index];
        if (sheetName === "📖 Instructions") continue;
        if (sheetName === "❌ Subject Achievement Comments ") continue;
        if (sheetName === "❌ Subject Achievement Comments by Student") continue;

        const sheet = workbook.Sheets[sheetName];
        let sheetData: unknown;

        if (sheetName === "✏️ Class Roster") {
            const rawData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
            }) as Array<Array<string | number>>;
            const headers = rawData[0] as string[];
            sheetData = {};

            for (let rowIndex = 1; rowIndex < rawData.length; rowIndex++) {
                const row = rawData[rowIndex];
                if (!row || row.length === 0) continue;

                const studentNumber = row[0] as number;
                const studentData: { [key: string]: string | number } = {};
                headers.forEach((header, index) => {
                    studentData[header] = row[index];
                });

                (sheetData as { [key: number]: { [key: string]: string | number } })[studentNumber] = studentData;
            }
        } else if (sheetName === "✏️ Subject Achievement Scores") {
            const rawData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
            }) as Array<Array<string | number>>;

            const semesters = rawData[0] as string[];
            const subjects = rawData[1] as string[];

            sheetData = {};

            for (let rowIndex = 2; rowIndex < rawData.length; rowIndex++) {
                const row = rawData[rowIndex];
                if (!row || row.length === 0) continue;

                const studentNumber = row[0] as number;
                const studentName = row[1] as string;

                const studentData: {
                    name: string;
                    s1: { [subject: string]: number };
                    s2: { [subject: string]: number };
                } = {
                    name: studentName,
                    s1: {},
                    s2: {},
                };

                for (let colIndex = 3; colIndex < row.length; colIndex++) {
                    const semester = semesters[colIndex];
                    const subject = subjects[colIndex];
                    const score = row[colIndex] as number;

                    if (!semester || !subject) continue;

                    if (semester === "S1") {
                        studentData.s1[subject.toLowerCase()] = score;
                    } else if (semester === "S2") {
                        studentData.s2[subject.toLowerCase()] = score;
                    }
                }

                (sheetData as { [key: number]: typeof studentData })[studentNumber] = studentData;
            }
        } else if (sheetName === "✏️ Subject Achievement Comments") {
            const rawData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
            }) as Array<Array<string | number>>;
            const semesters = rawData[0] as string[];
            const subjects = rawData[1] as string[];
            sheetData = {} as CommentData;

            for (let rowIndex = 2; rowIndex < rawData.length; rowIndex++) {
                const level = rawData[rowIndex][0] as string;
                if (!level) continue;

                if (!(sheetData as CommentData)[level]) (sheetData as CommentData)[level] = {};

                for (let colIndex = 1; colIndex < rawData[rowIndex].length; colIndex++) {
                    const semester = semesters[colIndex];
                    const subject = subjects[colIndex];
                    const comment = rawData[rowIndex][colIndex] as string;

                    if (!semester || !subject) continue;

                    if (!(sheetData as CommentData)[level][subject]) (sheetData as CommentData)[level][subject] = {};
                    if (!(sheetData as CommentData)[level][subject][semester]) (sheetData as CommentData)[level][subject][semester] = "";

                    (sheetData as CommentData)[level][subject][semester] = comment;
                }
            }
        } else if (sheetName === "✏️ 21st Century Skills, Learner") {
            const rawData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
            }) as Array<Array<string | number>>;

            const semesters = rawData[0] as string[];
            const skillNames = rawData[2] as string[];

            sheetData = {};

            for (let rowIndex = 3; rowIndex < rawData.length; rowIndex++) {
                const row = rawData[rowIndex];
                if (!row || row.length === 0) continue;

                const studentNumber = row[0] as number;
                const studentName = row[1] as string;

                const studentData: {
                    name: string;
                    s1: { [skill: string]: string };
                    s2: { [skill: string]: string };
                } = {
                    name: studentName,
                    s1: {},
                    s2: {},
                };

                for (let colIndex = 3; colIndex < row.length; colIndex++) {
                    const semester = semesters[colIndex];
                    const skillName = skillNames[colIndex];
                    const skillValue = row[colIndex] as string;

                    if (!semester || !skillName) continue;

                    if (semester === "S1") {
                        studentData.s1[skillName.toLowerCase()] = skillValue;
                    } else if (semester === "S2") {
                        studentData.s2[skillName.toLowerCase()] = skillValue;
                    }
                }

                (sheetData as { [key: number]: typeof studentData })[studentNumber] = studentData;
            }
        } else if (sheetName === "✏️ Comments") {
            const rawData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
            }) as Array<Array<string | number>>;

            sheetData = {};

            for (let rowIndex = 2; rowIndex < rawData.length; rowIndex++) {
                const row = rawData[rowIndex];
                if (!row || row.length === 0) continue;

                const studentNumber = row[0] as number;
                const studentName = row[1] as string;

                const studentData: {
                    name: string;
                    s1: string;
                    s2: string;
                } = {
                    name: studentName,
                    s1: row[3] as string,
                    s2: row[5] as string,
                };

                (sheetData as { [key: number]: typeof studentData })[studentNumber] = studentData;
            }
        } else {
            sheetData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
            });
        }

        sheetsData[sheetName] = sheetData;
    }

    return sheetsData;
}

export interface Student {
    Number: number;
    Name: string;
    Gender: string;
}

export interface SubjectAchievementComments {
    [key: string]: {
        S1: string;
        S2: string;
    };
}

export interface SubjectAchievementScores {
    [key: string]: {
        s1: { [subject: string]: number };
        s2: { [subject: string]: number };
    };
}

export interface CenturySkills {
    [key: string]: {
        name: string;
        s1: { [skill: string]: string };
        s2: { [skill: string]: string };
    };
}

export interface Data {
    "✏️ Class Roster": { [key: string]: Student };
    "✏️ Subject Achievement Comments": { [key: string]: SubjectAchievementComments };
    "✏️ 21st Century Skills, Learner": CenturySkills;
    "✏️ Subject Achievement Scores": SubjectAchievementScores;
    "✏️ Comments": Comments;
}

export interface SplitData {
    females: Data;
    males: Data;
}

export function splitByGender(data: Data): SplitData {
    const females: Data = {
        "✏️ Class Roster": {},
        "✏️ Subject Achievement Comments": data["✏️ Subject Achievement Comments"], // Unmodified
        "✏️ 21st Century Skills, Learner": {},
        "✏️ Subject Achievement Scores": {},
        "✏️ Comments": {},
    };

    const males: Data = {
        "✏️ Class Roster": {},
        "✏️ Subject Achievement Comments": data["✏️ Subject Achievement Comments"], // Unmodified
        "✏️ 21st Century Skills, Learner": {},
        "✏️ Subject Achievement Scores": {},
        "✏️ Comments": {},
    };

    // Split the class roster by gender
    for (const [studentId, student] of Object.entries(data["✏️ Class Roster"])) {
        if (student.Gender === "Female") {
            females["✏️ Class Roster"][studentId] = student;
        } else if (student.Gender === "Male") {
            males["✏️ Class Roster"][studentId] = student;
        }
    }

    // Split the rest of the data based on gender
    const otherKeys: (keyof Data)[] = [
        "✏️ 21st Century Skills, Learner",
        "✏️ Subject Achievement Scores",
        "✏️ Comments",
    ];

    for (const key of otherKeys) {
        for (const [studentId, studentData] of Object.entries(data[key])) {
            if (studentId in females["✏️ Class Roster"]) {
                females[key][studentId] = studentData as never;
            } else if (studentId in males["✏️ Class Roster"]) {
                males[key][studentId] = studentData as never;
            }
        }
    }

    return { females, males };
}

export function transformToPDF(data: Data): PDF[] {
    const pdfArray: PDF[] = [];

    for (const [studentId, student] of Object.entries(data["✏️ Class Roster"])) {
        const studentFields: StudentField = {
            field_id: `field_${studentId}`,
            student_id: studentId,
            collaboration: getSkillData(data, studentId, "collaboration"),
            communication: getSkillData(data, studentId, "communication"),
            inquiry: getSkillData(data, studentId, "inquiry"),
            listening: getSubjectData(data, studentId, "listening", "Listening"),
            mathematics: getSubjectData(data, studentId, "math", "Maths"),
            open_minded: getSkillData(data, studentId, "open-minded"),
            organization: getSkillData(data, studentId, "organisation"),
            reading: getSubjectData(data, studentId, "reading", "Reading"),
            responsibility: getSkillData(data, studentId, "responsibility"),
            risk_taking: getSkillData(data, studentId, "risk-taking"),
            science: getSubjectData(data, studentId, "science", "Science"),
            social_studies: getSubjectData(data, studentId, "socstudies", "Social Studies"),
            speaking: getSubjectData(data, studentId, "speaking", "Speaking"),
            thinking: getSkillData(data, studentId, "thinking"),
            use_of_english: getSubjectData(data, studentId, "uoe", "Use of English"),
            writing: getSubjectData(data, studentId, "writing", "Writing"),
            comment: {
                s1: data["✏️ Comments"][studentId]?.s1?.toString() || "",
                s2: data["✏️ Comments"][studentId]?.s2?.toString() || "",
            },
        };

        const pdf: PDF = {
            student_name: student.Name,
            student_number: student.Number.toString(),
            student_fields: studentFields,
        };

        pdfArray.push(pdf);
    }

    return pdfArray;
}

function getSkillData(data: Data, studentId: string, skill: string) {
    const skillsData = data["✏️ 21st Century Skills, Learner"][studentId];
    return {
        s1: skillsData?.s1[skill] || "",
        s2: skillsData?.s2[skill] || "",
    };
}

function getSubjectData(data: Data, studentId: string, subjectKey: string, subjectName: string) {
    const scoresData = data["✏️ Subject Achievement Scores"][studentId];
    const s1Level = scoresData?.s1[subjectKey]?.toString()
    const s2Level = scoresData?.s2[subjectKey]?.toString()
    const commentsDataS1 = data["✏️ Subject Achievement Comments"][s1Level];
    const commentsDataS2 = data["✏️ Subject Achievement Comments"][s2Level];
    return {
        s1: scoresData?.s1[subjectKey]?.toString() || "",
        s1_comment: commentsDataS1?.[subjectName]?.S1 || "",
        s2: scoresData?.s2[subjectKey]?.toString() || "",
        s2_comment: commentsDataS2?.[subjectName]?.S2 || "",
    };
}