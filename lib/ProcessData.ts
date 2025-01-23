// processXLSXData.ts
import * as XLSX from "xlsx";

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