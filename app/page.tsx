import FileUploadForm from "@/components/UploadForm";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
    return (
        <div className="flex flex-col gap-10 items-center w-full mx-auto max-w-xl">
            <div className="mt-10">
                <FileUploadForm />
            </div>
            <div className="space-y-5 pl-5 self-start w-full">
                <div className="text-3xl text-center w-full mx-auto">
                    How to Use
                </div>
                <ol
                    type="1"
                    className="list-decimal space-y-1 text-start self-start [&>li]:pl-3"
                >
                    <li>
                        Copy the{" "}
                        <Link
                            className="link"
                            href="https://docs.google.com/spreadsheets/d/1RMAvgofCF4e8ARxW2J-Yhyn2ICVqGJNw3eDfKCj3LHg/copy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span>
                                template{" "}
                                <ExternalLink
                                    className="inline"
                                    size={16}
                                />
                            </span>
                        </Link>
                        .
                    </li>
                    <li>
                        Check the <strong>📖 Instructions</strong> sheets to
                        fill out the template.
                    </li>
                    <li>
                        Download the complete template as{" "}
                        <strong>Microsoft Excel (.xlsx)</strong>.
                    </li>
                    <li>
                        Drag <i>Reparper Template.xlsx</i> into the upload box
                        above.
                    </li>
                </ol>
            </div>
            <div className="space-y-5">
                <div className="text-3xl text-center">
                    Why You Should Use It
                </div>
                <p>
                    I use it because I don&apos;t think the user experience (UX)
                    of manually adding all these data into the PDFs is very
                    good. Yes, you have to manually input the data into the
                    Google Sheet, but I think the UX is far better in the Google
                    Sheet than in the PDF.
                </p>
                <p>Here&apos;s some more reasons:</p>
                <ul className="list-none space-y-1 pl-10">
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        You only have to manually input the Subject Achievement
                        Comments once instead of 28 times.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        You don&apos;t have to manually input student numbers
                        and names 28 times.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        You don&apos;t have to manually add your name 28 times.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        You don&apos;t have to suffer through poor tab
                        navigation inside the PDF.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        Your team leader can easily create the Subject
                        Achievement Comments sheet for the entire team, further
                        increasing efficiency.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        Richie doesn&apos;t have to manually input the grade,
                        semester, and date 28 times per class, which comes out
                        to 672 times for all classes in all grades.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        Some of the sheets have a table of sums at the bottom.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        The <strong>✏️ Comments</strong> sheet counts the number
                        of words for you.
                    </li>
                </ul>
            </div>
            <div className="space-y-5 w-full mx-auto">
                <div className="text-3xl text-center">FAQ</div>
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                >
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            Is the student data secure?
                        </AccordionTrigger>
                        <AccordionContent>
                            Yes, because no data is sent to any server on this
                            website. All the data processing and PDF creating
                            occurs entirely on your computer by your computer.
                            The jargon for this type of site is a &quot;fully
                            client-side website&quot; because all computing is
                            performed on the client, i.e. on your computer using
                            the browser you choose.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>
                            How do I provide feedback and suggestions?
                        </AccordionTrigger>
                        <AccordionContent>
                            Just message me on Google Chat at{" "}
                            <Link
                                className="link"
                                // href="https://mail.google.com/chat/u/0/#chat/email/michael.fitzgerald@younghoon.org"
                                // href="https://chat.google.com/dm/michael.fitzgerald@younghoon.org"
                                href="https://chat.google.com/?email=michael.fitzgerald@younghoon.org"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                michael.fitzgerald@younghoon.org
                            </Link>
                            !
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>What&apos;s next?</AccordionTrigger>
                        <AccordionContent>
                            Maybe an entire site to manage all things report
                            cards? Not sure.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
