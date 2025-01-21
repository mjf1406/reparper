import { Button } from "@/components/ui/button";
import { Code2Icon, CodeIcon } from "lucide-react";
import Link from "next/link";

const Footer = () => {
    // Define the links with label in plain English
    const links = [
        {
            href: "https://mr-monkey-portfolio.vercel.app/",
            label: "Meet the Dev",
            icon: <CodeIcon className="h-4 w-4" />,
        },
        {
            href: "https://github.com/mjf1406/reparper",
            label: "Source Code",
            icon: <Code2Icon className="h-4 w-4" />,
        },
    ];

    return (
        <footer className="flex w-full flex-col items-center justify-center gap-6 py-6 bg-accent mt-20">
            <div className="flex gap-4">
                {links.map(({ href, label, icon }) => (
                    <Button
                        key={href}
                        variant="ghost"
                        size="sm"
                        className="flex gap-2 link"
                        asChild
                    >
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {icon}
                            <span>{label}</span>
                        </a>
                    </Button>
                ))}
            </div>

            <div className="text-2xs font-[family-name:var(--font-geist-mono)] flex flex-col gap-2 items-center justify-center">
                <div className="">
                    Code © {new Date().getFullYear()}. Licensed under{" "}
                    <Link
                        className="link"
                        href="https://opensource.org/license/mit"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        MIT
                    </Link>
                    .
                </div>
                <div>
                    <Link
                        className="link"
                        href="https://www.vecteezy.com/vector-art/3516411-cute-sun-icon-vector-illustration"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Cute Sun icon
                    </Link>{" "}
                    from{" "}
                    <Link
                        className="link"
                        href={"https://www.vecteezy.com/members/gankogroup"}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        gankogroup
                    </Link>
                </div>
                <div>
                    <Link
                        className="link"
                        href="https://www.vecteezy.com/vector-art/46917894-cute-cartoon-smiling-moon-character-childish-style-moon-icon-illustration"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Cute Moon icon
                    </Link>{" "}
                    from{" "}
                    <Link
                        className="link"
                        href={"https://www.vecteezy.com/members/psychoche9"}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        psychoche9
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
