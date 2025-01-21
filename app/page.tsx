import { FileUploader } from "@/components/ui/file-uploader";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col gap-10 items-center w-full mx-auto max-w-xl">
            <div>
                <FileUploader className="w-full mx-auto" />
            </div>
            <div className="space-y-5">
                <div className="text-3xl text-center">How to Use</div>
                <ol
                    type="1"
                    className="list-decimal space-y-1"
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
                        <strong>Microsoft Excel (.xlsx)</strong> from Google
                        Sheets.
                    </li>
                    <li>Drag the XLSX into the dropbox above.</li>
                    <li>Watch the magic happen.</li>
                </ol>
            </div>
            <div className="space-y-5">
                <div className="text-3xl text-center">
                    Why You Should Use It
                </div>
                <p></p>
            </div>
        </div>
    );
}
