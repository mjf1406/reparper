export const APP_NAME = "Reparper"
export type Grade = "1" | "2" | "3" | "4" | "5" | "6";
export const TITLE_FONT_SIZE = 20
export const COVER_PAGE_FONT_SIZE = 15
export const CENTURY_SKILLS_FONT_SIZE = 11
export const SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE = 7.5
export const COMMENT_FONT_SIZE = 8.5
export const GRADE_FORM_URLS: Record<Grade, string> = {
    1: "https://68ialhn9h2.ufs.sh/f/5234b4e8-92e5-4934-bc32-2fe376e43760-1javl8.pdf", // TODO: Do I need to replace with with a grade-specific report card?
    2: "https://68ialhn9h2.ufs.sh/f/5234b4e8-92e5-4934-bc32-2fe376e43760-1javl8.pdf", // TODO: Do I need to replace with with a grade-specific report card?
    3: "https://68ialhn9h2.ufs.sh/f/5234b4e8-92e5-4934-bc32-2fe376e43760-1javl8.pdf", // TODO: Do I need to replace with with a grade-specific report card?
    4: "https://68ialhn9h2.ufs.sh/f/5234b4e8-92e5-4934-bc32-2fe376e43760-1javl8.pdf", // TODO: Do I need to replace with with a grade-specific report card?
    5: "https://68ialhn9h2.ufs.sh/f/5234b4e8-92e5-4934-bc32-2fe376e43760-1javl8.pdf",
    6: "https://68ialhn9h2.ufs.sh/f/5234b4e8-92e5-4934-bc32-2fe376e43760-1javl8.pdf", // TODO: Do I need to replace with with a grade-specific report card?
  };
export const SEMESTER_WORD_MAP = {
    1: "One",
    2: "Two",
}
export const GRADE_WORD_MAP = {
    1: "One",
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
    6: "Siz",
}
export const studentLetters: string[] = [
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
export const prefixArray = [
    // Reading OJ
    // the below just use the student letter
    // e.g. if it's student b, then it would be
    // Student b
    { name: "student_name", prefix: "Student " },
    { name: "student_number", prefix: "number " },
    { name: "title", prefix: "Text15", font: "Cambria Bold"},
    { name: "date", prefix: "July/feb", font: "Calibri"},
    { name: "teacher name", prefix: "T:name", font: "Calibri"},
    // --- 21st Century Skills, Learner Traits, and Work Habits ---
    // the below use the letter once and the semester number
    // e.g. if the semester is 1 for student b, then it would be
    // Res1b
    { json: "student21stCenturySkills", name: "responsibility", prefix: "Res" },
    { json: "student21stCenturySkills", name: "organization", prefix: "Or" },
    { json: "student21stCenturySkills", name: "collaboration", prefix: "co" },
    { json: "student21stCenturySkills", name: "communication", prefix: "Com" },
    { json: "student21stCenturySkills", name: "thinking", prefix: "thin" },
    { json: "student21stCenturySkills", name: "inquiry", prefix: "inqu" },
    { json: "student21stCenturySkills", name: "risk_taking", prefix: "ref" },
    { json: "student21stCenturySkills", name: "open_minded", prefix: "rt" },
    // --- Skill and Habits Comment ---
    // the below uses the semester number then the letter once
    // e.g. if the semester is 1 and the letter is b
    // Skills/Habits 1b
    { json: "studentComments", name: "comment", prefix: "Skills/Habits " },
    // --- Subject Achievement Scores ---
    // the below uses the semester number then the letter twice
    // e.g. if the letter is b, then it would be
    // R1bb (name + semester + letter + letter)
    { json: "studentSubjectAchievementScores", name: "reading_score", prefix: "R" },
    { json: "studentSubjectAchievementScores", name: "writing_score", prefix: "W" },
    { json: "studentSubjectAchievementScores", name: "speaking_score", prefix: "Sp" },
    { json: "studentSubjectAchievementScores", name: "listening_score", prefix: "L" },
    { json: "studentSubjectAchievementScores", name: "use_of_english_score", prefix: "UE" },
    { json: "studentSubjectAchievementScores", name: "mathematics_score", prefix: "M" },
    { json: "studentSubjectAchievementScores", name: "social_studies_score", prefix: "SS" },
    { json: "studentSubjectAchievementScores", name: "science_score", prefix: "SC" },
    // --- Subject Achievement Comments ---
    // the below use the letter twice
    // e.g. if the letter is b, then it would be
    // Reading Textbb
    // These are the fields for the Strengths/Next Steps for Improvements, i.e. the subject comments
    { json: "studentSubjectAchievementComments", name: "reading", prefix: "Reading Text" },
    { json: "studentSubjectAchievementComments", name: "writing", prefix: "Writing Text" },
    { json: "studentSubjectAchievementComments", name: "speaking", prefix: "Speaking Text" },
    { json: "studentSubjectAchievementComments", name: "listening", prefix: "Listening Text" },
    { json: "studentSubjectAchievementComments", name: "use_of_english", prefix: "Use of English Text" },
    { json: "studentSubjectAchievementComments", name: "mathematics", prefix: "math Text" },
    { json: "studentSubjectAchievementComments", name: "social_studies", prefix: "S.S Text" },
    { json: "studentSubjectAchievementComments", name: "science", prefix: "SciText" },
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