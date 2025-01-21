"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function HeroLearn() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className="flex flex-col gap-5 justify-start mt-24 items-center min-h-screen max-w-lg">
            <div className="relative -z-10">
                <Image
                    src="/sprouty-student.png" // Path relative to the public folder
                    alt="Sprouty Student Mascot"
                    width={300} // Adjust width as needed
                    height={300} // Adjust height as needed
                    className="rounded-lg" // Optional: Add styling classes
                />
                {/* Speech Bubble */}
                <div className="absolute -top-20 border-black dark:border-white border -right-12 bg-secondary p-4 rounded-lg shadow-lg max-w-[200px] flex flex-col items-center">
                    <p className="text-lg text-center">
                        Hi! I&apos;m Sprouty! Let&apos;s learn about the web
                        together!
                    </p>
                    {/* SVG Tail */}
                    <svg
                        className="w-10 h-10 absolute -bottom-6 -left-6 rotate-45"
                        viewBox="0 0 20 10"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="hsl(var(--secondary))"
                        stroke={isDark ? "#fff" : "#000"}
                    >
                        <path d="M0 -8 L20 15 L17 -12 Z" />
                    </svg>
                </div>
            </div>
            {/* Super Clear Heading */}
            <h1 className="text-4xl font-bold self-start">
                Learn websites the fun way!
            </h1>
            {/* Simple Explanation */}
            <p className="text-lg md:text-base">
                Ever wonder what a Navbar, Hamburger Menu, or Pop-Up is? Sprouty
                up there will teach you all about the parts of websites with fun
                lessons and activities. Let&apos;s go!
            </p>
            {/* Call to Action */}
            <div className="space-x-2 self-start">
                <Link href={"/learn/lesson"}>
                    <Button>
                        Start Learning! <ArrowRightIcon />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
