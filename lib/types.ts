// types.ts
export type Grade = "1" | "2" | "3" | "4" | "5" | "6";
export type Semester = "1" | "2";

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

export interface Comments {
    [key: string]: {
        name: string;
        s1: string;
        s2: string;
    };
}

export interface Data {
    "✏️ Class Roster": { [key: string]: Student };
    "✏️ Subject Achievement Comments": { [level: string]: SubjectAchievementComments };
    "✏️ 21st Century Skills, Learner": CenturySkills;
    "✏️ Subject Achievement Scores": SubjectAchievementScores;
    "✏️ Comments": Comments;
}

export interface SplitData {
    females: Data;
    males: Data;
}

export interface PDF {
    student_name: string;
    student_number: string;
    student_fields: StudentField;
}

export interface StudentField {
    field_id: string;
    student_id: string;
    collaboration: { s1: string; s2: string };
    communication: { s1: string; s2: string };
    inquiry: { s1: string; s2: string };
    listening: { s1: string; s1_comment: string; s2: string; s2_comment: string };
    mathematics: { s1: string; s1_comment: string; s2: string; s2_comment: string };
    open_minded: { s1: string; s2: string };
    organization: { s1: string; s2: string };
    reading: { s1: string; s1_comment: string; s2: string; s2_comment: string };
    responsibility: { s1: string; s2: string };
    risk_taking: { s1: string; s2: string };
    science: { s1: string; s1_comment: string; s2: string; s2_comment: string };
    social_studies: { s1: string; s1_comment: string; s2: string; s2_comment: string };
    speaking: { s1: string; s1_comment: string; s2: string; s2_comment: string };
    thinking: { s1: string; s2: string };
    use_of_english: { s1: string; s1_comment: string; s2: string; s2_comment: string };
    writing: { s1: string; s1_comment: string; s2: string; s2_comment: string };
    comment: { s1: string; s2: string };
}

export type CombinedData = {
    [key: string]: unknown;
    "✏️ Comments": {
      [key: string]: {
        name: string;
        s1: string | number;
        s2: string | number;
      };
    };
  };