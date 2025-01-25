# Reparper

Easily fill out your Younghoon report cards with the magic of programming.

## To-do List

### p0

-   BE: use can now upload report card template
    -   this is needed because the Subject Achievement Comments (\_og) change on a semester basis and might also change on a grade basis.
-   PDF: need to make sure the fonts are the correct fonts. Using custom fonts makes the generation SOO slow.
-   PDF: long comment also needs some padding
-   PDF: Subject Achievement Comments need some padding
-   PDF: Subject Achievement Scores should be bold
-   PDF: 2st Century Skills Scores should be bold

## Change Log

2025/01/25

-   BE: data is mapped to the correct fields
-   UX: PDFs are generated and downloaded
-   BE: data is ingested into state
-   BE: Ensure there are line breaks between each Subject Achievement Comment bullet point.
-   BE: Ensure the comments remove new line breaks and that they are replaced with spaces when adding the Long-form Comments

2025/01/24

-   BE: PDF populates now!
-   UX: added loading states for the PDF generation

2025/01/23

-   BE: preliminary data ETL is complete

2025/01/23

-   UI: a dialog opens upon successfully validated template.xlsx
-   UI: added a button to re-open the dialog in case it was closed by accident
-   UX: added an FAQ
-   UX: added more reasons for using it
-   UI: updated the upload box states for loading and upload complete
-   UX: added a dialog that opens after user uploads a valid file, open a dialog for them to set:
    -   Date (February 7th, 2025)
    -   Name (Mr. Fitzgerald)
    -   Grade (1, 2, 3, 4, 5, or 6)
    -   Class Number (1, 2, 3, or 4)
    -   Semester (1 or 2)

2025/01/21

-   UX: file upload errors are now displayed on the page
-   UI: added Why You Should Use It section
-   UX: improved readability of destructive color

2025/01/21

-   UI: basic UI is up and running
-   UI: Instructions are done
-   UI: added heading for Why You SHould Use It

## Attributions

-   [uploadthing](https://uploadthing.com/) for storing the files securely.
-   [pdfFiller](https://www.pdffiller.com/) for helping me to find the field names, without which, this might not have been possible.
