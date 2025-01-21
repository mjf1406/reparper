import FileUploadForm from "@/components/UploadForm";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col gap-10 items-center w-full mx-auto max-w-xl">
            <div>
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
                    <li>Drag the XLSX into the dropbox above.</li>
                    <li>Watch the magic happen.</li>
                </ol>
            </div>
            <div className="space-y-5">
                <div className="text-3xl text-center">
                    Why You Should Use It
                </div>
                <p>
                    I use it because I don&apos;t think the user experience of
                    manually adding this information into the PDFs is very good.
                    Yes, you have to manually input them into the Google Sheet,
                    but I think the UX is far better in the Google Sheet than in
                    the PDFs.
                </p>
                <p>Here&apos;s some more reasons:</p>
                <ul className="list-none space-y-1 pl-10">
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        You only have to manually input the Subject Achievement
                        Comments once instead of 28 times.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        Some of the sheets have a table of sums at the bottom.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        The <strong>✏️ Comments</strong> sheet counts the number
                        of words for you.
                    </li>
                    <li className="relative before:content-['👍'] before:absolute before:left-[-2em] before:top-0">
                        There may be more...
                    </li>
                </ul>
            </div>
        </div>
    );
}
