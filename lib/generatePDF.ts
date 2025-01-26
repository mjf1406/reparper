import { CENTURY_SKILLS_FONT_SIZE, COMMENT_FONT_SIZE, COVER_PAGE_FONT_SIZE, Grade, GRADE_WORD_MAP, SEMESTER_WORD_MAP, studentLetters, SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE, TITLE_FONT_SIZE } from "./constants"
import { StudentField } from "./types"
import { PDFDocument } from "pdf-lib";
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
    data: PDF[],
    semester: string,
    sex: string,
    className: string,
    classYear: string,
    classGrade: Grade,
    publishDate: string,
    teacherName: string,
    templatePdfBytes: Uint8Array // New optional parameter
) {
    // const formUrl = GRADE_FORM_URLS[classGrade];
    // const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templatePdfBytes);
    pdfDoc.registerFontkit(fontkit);
      
    // const calibriBoldFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDQBe79FA3NaDc8h7ylKOFuZfwHr6o1sxzInLm').then(r => r.arrayBuffer());
    // const calibriFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDlaxbqQtj436hbI2XTiBqMLrt1U7spvEw5ofF').then(r => r.arrayBuffer());
    // const cambriaBoldFontBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDfwlmA1uCxXVGRnoBmhADsIi58ZgW2ptSTuHe').then(r => r.arrayBuffer());
    // const firaSansRegularBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDyRg3H4EsbVR3ALxUmWQezgiYId5G2H9MTPSv').then(r => r.arrayBuffer());
    // const firaSansBoldBytes = await fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwD1CcICKzGj4mEaiNZzkFnbyhver0O8ScVfsYp').then(r => r.arrayBuffer());
    
    // Fonts
    const [
        calibriFontBytes,
        calibriBoldFontBytes,
        cambriaBoldFontBytes,
        firaSansRegularBytes,
        firaSansBoldBytes
    ] = await Promise.all([
        fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDlaxbqQtj436hbI2XTiBqMLrt1U7spvEw5ofF').then(r => r.arrayBuffer()), // Calibri
        fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDQBe79FA3NaDc8h7ylKOFuZfwHr6o1sxzInLm').then(r => r.arrayBuffer()), // Calibri Bold
        fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDfwlmA1uCxXVGRnoBmhADsIi58ZgW2ptSTuHe').then(r => r.arrayBuffer()), // Cambria Bold
        fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwDyRg3H4EsbVR3ALxUmWQezgiYId5G2H9MTPSv').then(r => r.arrayBuffer()), // Fira Sans Regular
        fetch('https://68ialhn9h2.ufs.sh/f/pK4nD7CymfwD1CcICKzGj4mEaiNZzkFnbyhver0O8ScVfsYp').then(r => r.arrayBuffer())  // Fira Sans Bold
    ]);
  
  // Now you can use the font bytes as needed
  console.log(calibriFontBytes, calibriBoldFontBytes, cambriaBoldFontBytes, firaSansRegularBytes, firaSansBoldBytes);

    const calibriFont = await pdfDoc.embedFont(calibriFontBytes);
    // const calibriBoldFont = await pdfDoc.embedFont(calibriBoldFontBytes);
    const cambriaBoldFont = await pdfDoc.embedFont(cambriaBoldFontBytes);
    const firaSansRegularFont = await pdfDoc.embedFont(firaSansRegularBytes);
    const firaSansBoldFont = await pdfDoc.embedFont(firaSansBoldBytes)

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
        // Student Name
        const fieldStudentName = form.getTextField(`Student ${studentLetter}`)
        fieldStudentName.setFontSize(COVER_PAGE_FONT_SIZE)
        fieldStudentName.setText(element.student_name)
        fieldStudentName.updateAppearances(firaSansRegularFont)
        // Student Number
        const fieldStudentNumber = form.getTextField(`number ${studentLetter}`)
        fieldStudentNumber.setFontSize(COVER_PAGE_FONT_SIZE)
        fieldStudentNumber.setText(`${className.replaceAll("-", "")}${String(element.student_number).padStart(2, '0')}`)
        fieldStudentNumber.updateAppearances(firaSansRegularFont)
        // Long Comment
        const fieldComment = form.getTextField(`Skills/Habits 1${studentLetter}`)
        fieldComment.setFontSize(COMMENT_FONT_SIZE)
        fieldComment.setText(studentFields.comment[`s${semester}` as keyof typeof studentFields.comment]);
        // fieldComment.updateAppearances(firaSansRegularFont) // TODO: updating this causes the function to slow down by about 10 times and to give the field an undesirable line spacing
        // Subject Achievement Comments
            // Reading
            const fieldReadingComment = form.getTextField(`Reading Text${studentLetter}${studentLetter}`);
            fieldReadingComment.setFontSize(SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE);
            fieldReadingComment.setText(studentFields.reading[`s${semester}_comment` as keyof typeof studentFields.reading].replaceAll("\r\n", "\n"));
            fieldReadingComment.updateAppearances(firaSansRegularFont);
            // Writing
            const fieldWritingComment = form.getTextField(`Writing Text${studentLetter}${studentLetter}`);
            fieldWritingComment.setFontSize(SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE);
            fieldWritingComment.setText(studentFields.writing[`s${semester}_comment` as keyof typeof studentFields.writing].replaceAll("\r\n", "\n"));
            fieldWritingComment.updateAppearances(firaSansRegularFont);
            // Speaking
            const fieldSpeakingComment = form.getTextField(`Speaking Text${studentLetter}${studentLetter}`);
            fieldSpeakingComment.setFontSize(SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE);
            fieldSpeakingComment.setText(studentFields.speaking[`s${semester}_comment` as keyof typeof studentFields.speaking].replaceAll("\r\n", "\n"));
            fieldSpeakingComment.updateAppearances(firaSansRegularFont);
            // Listening
            const fieldListeningComment = form.getTextField(`Listening Text${studentLetter}${studentLetter}`);
            fieldListeningComment.setFontSize(SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE);
            fieldListeningComment.setText(studentFields.listening[`s${semester}_comment` as keyof typeof studentFields.listening].replaceAll("\r\n", "\n"));
            fieldListeningComment.updateAppearances(firaSansRegularFont);
            // Use of English
            const fieldUseOfEnglishComment = form.getTextField(`Use of English Text${studentLetter}${studentLetter}`);
            fieldUseOfEnglishComment.setFontSize(SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE);
            fieldUseOfEnglishComment.setText(studentFields.use_of_english[`s${semester}_comment` as keyof typeof studentFields.use_of_english].replaceAll("\r\n", "\n"));
            fieldUseOfEnglishComment.updateAppearances(firaSansRegularFont);
            // Math
            const fieldMathComment = form.getTextField(`math Text${studentLetter}${studentLetter}`);
            fieldMathComment.setFontSize(SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE);
            fieldMathComment.setText(studentFields.mathematics[`s${semester}_comment` as keyof typeof studentFields.mathematics].replaceAll("\r\n", "\n"));
            fieldMathComment.updateAppearances(firaSansRegularFont);
            // Social Studies
            const fieldSocialStudiesComment = form.getTextField(`S.S Text${studentLetter}${studentLetter}`);
            fieldSocialStudiesComment.setFontSize(SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE);
            fieldSocialStudiesComment.setText(studentFields.social_studies[`s${semester}_comment` as keyof typeof studentFields.social_studies].replaceAll("\r\n", "\n"));
            fieldSocialStudiesComment.updateAppearances(firaSansRegularFont);
            // Science
            const fieldScienceComment = form.getTextField(`SciText${studentLetter}${studentLetter}`);
            fieldScienceComment.setFontSize(SUBJECT_ACHIEVEMENT_COMMENT_FONT_SIZE);
            fieldScienceComment.setText(studentFields.science[`s${semester}_comment` as keyof typeof studentFields.science].replaceAll("\r\n", "\n"));
            fieldScienceComment.updateAppearances(firaSansRegularFont);
       
        for (let sem = 1; sem <= Number(semester); sem++) {
            // 21st Century Skills, Learner TRaits, and Work Habits
                // Responsibility
                const fieldScienceComment = form.getTextField(`Res${sem}${studentLetter}`);
                fieldScienceComment.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldScienceComment.setText(studentFields.responsibility[`s${sem}` as keyof typeof studentFields.responsibility]);
                fieldScienceComment.updateAppearances(firaSansBoldFont);
                // Organization
                const fieldOrganizationComment = form.getTextField(`Or${sem}${studentLetter}`);
                fieldOrganizationComment.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldOrganizationComment.setText(studentFields.organization[`s${sem}` as keyof typeof studentFields.organization]);
                fieldOrganizationComment.updateAppearances(firaSansBoldFont);
                // Collaboration
                const fieldCollaborationComment = form.getTextField(`co${sem}${studentLetter}`);
                fieldCollaborationComment.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldCollaborationComment.setText(studentFields.collaboration[`s${sem}` as keyof typeof studentFields.collaboration]);
                fieldCollaborationComment.updateAppearances(firaSansBoldFont);
                // Communication
                const fieldCommunicationComment = form.getTextField(`Com${sem}${studentLetter}`);
                fieldCommunicationComment.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldCommunicationComment.setText(studentFields.communication[`s${sem}` as keyof typeof studentFields.communication]);
                fieldCommunicationComment.updateAppearances(firaSansBoldFont);
                // Thinking
                const fieldThinkingComment = form.getTextField(`thin${sem}${studentLetter}`);
                fieldThinkingComment.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldThinkingComment.setText(studentFields.thinking[`s${sem}` as keyof typeof studentFields.thinking]);
                fieldThinkingComment.updateAppearances(firaSansBoldFont);
                // Inquiry
                const fieldInquiryComment = form.getTextField(`inqu${sem}${studentLetter}`);
                fieldInquiryComment.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldInquiryComment.setText(studentFields.inquiry[`s${sem}` as keyof typeof studentFields.inquiry]);
                fieldInquiryComment.updateAppearances(firaSansBoldFont);
                // Risk Taking
                const fieldRiskTakingComment = form.getTextField(`ref${sem}${studentLetter}`);
                fieldRiskTakingComment.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldRiskTakingComment.setText(studentFields.risk_taking[`s${sem}` as keyof typeof studentFields.risk_taking]);
                fieldRiskTakingComment.updateAppearances(firaSansBoldFont);
                // Open-Minded
                const fieldOpenMindedComment = form.getTextField(`rt${sem}${studentLetter}`);
                fieldOpenMindedComment.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldOpenMindedComment.setText(studentFields.open_minded[`s${sem}` as keyof typeof studentFields.open_minded]);
                fieldOpenMindedComment.updateAppearances(firaSansBoldFont);
            // Subject Achievement Scores
                // Reading
                const fieldReadingScore = form.getTextField(`R${sem}${studentLetter}${studentLetter}`);
                fieldReadingScore.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldReadingScore.setText(studentFields.reading[`s${sem}` as keyof typeof studentFields.reading]);
                fieldReadingScore.updateAppearances(firaSansBoldFont);
                // Writing
                const fieldWritingScore = form.getTextField(`W${sem}${studentLetter}${studentLetter}`);
                fieldWritingScore.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldWritingScore.setText(studentFields.writing[`s${sem}` as keyof typeof studentFields.writing]);
                fieldWritingScore.updateAppearances(firaSansBoldFont);
                // Speaking
                const fieldSpeakingScore = form.getTextField(`Sp${sem}${studentLetter}${studentLetter}`);
                fieldSpeakingScore.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldSpeakingScore.setText(studentFields.speaking[`s${sem}` as keyof typeof studentFields.speaking]);
                fieldSpeakingScore.updateAppearances(firaSansBoldFont);
                // Listening
                const fieldListeningScore = form.getTextField(`L${sem}${studentLetter}${studentLetter}`);
                fieldListeningScore.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldListeningScore.setText(studentFields.listening[`s${sem}` as keyof typeof studentFields.listening]);
                fieldListeningScore.updateAppearances(firaSansBoldFont);
                // Use of English
                const fieldUseOfEnglishScore = form.getTextField(`UE${sem}${studentLetter}${studentLetter}`);
                fieldUseOfEnglishScore.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldUseOfEnglishScore.setText(studentFields.use_of_english[`s${sem}` as keyof typeof studentFields.use_of_english]);
                fieldUseOfEnglishScore.updateAppearances(firaSansBoldFont);
                // Mathematics
                const fieldMathematicsScore = form.getTextField(`M${sem}${studentLetter}${studentLetter}`);
                fieldMathematicsScore.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldMathematicsScore.setText(studentFields.mathematics[`s${sem}` as keyof typeof studentFields.mathematics]);
                fieldMathematicsScore.updateAppearances(firaSansBoldFont);
                // Social Studies
                const fieldSocialStudiesScore = form.getTextField(`SS${sem}${studentLetter}${studentLetter}`);
                fieldSocialStudiesScore.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldSocialStudiesScore.setText(studentFields.social_studies[`s${sem}` as keyof typeof studentFields.social_studies]);
                fieldSocialStudiesScore.updateAppearances(firaSansBoldFont);
                // Science
                const fieldScienceScore = form.getTextField(`SC${sem}${studentLetter}${studentLetter}`);
                fieldScienceScore.setFontSize(CENTURY_SKILLS_FONT_SIZE);
                fieldScienceScore.setText(studentFields.science[`s${sem}` as keyof typeof studentFields.science]);
                fieldScienceScore.updateAppearances(firaSansBoldFont);
                
            if (semester === "1") break
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