# Reparper

Easily fill out your Younghoon report cards with the magic of programming.

## To-do List

### p0

-   BE: make the Gradebook Google Sheet have a better UX to share with teachers
-   PDF: long comment also needs some padding and the font set, but setting the font slows down the generation by 10x and adds like a 1.25 line spacing which we don't want.
-   PDF: Subject Achievement Comments need some padding

## Change Log

2025/01/26

-   UX: I need to update the Instructions sheet and ensure there is also a demo template filled with synthetic data
-   UX: user can now upload report card templates
-   UI: added an error monkey image
-   UI: added a 404 monkey image
-   BUG: hydration error on initial load no longer occurs.
-   UI: when clicking the X to remove a file, it now resets the upload box's state to null
-   UI: Submit additional information button only shows if both pdf and xlsx are uploaded
-   UX: blanked the Reparper Template
-   UX: added a Reparper Template (Demo) and a link to the UI

2025/01/25

-   PDF: need to make sure the fonts are the correct fonts. Using custom fonts in the long comment field (Skills/Habits) makes the generation SOO slow for some reason, so we've skipped it. It also gives the text an undesirable line spacing.
-   PDF: Subject Achievement Scores should be bold
-   PDF: 2st Century Skills Scores should be bold
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
