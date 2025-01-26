"use client";

import * as React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

import CuteSun from "@/app/icons/cute-sun.png";
import CuteMoon from "@/app/icons/cute-moon.png";

const SIZE = 52;

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder with the same dimensions during SSR
        return (
            <Button
                variant="ghost"
                style={{
                    height: `${SIZE}px`,
                    width: `${SIZE}px`,
                    position: "relative",
                }}
                aria-hidden
            >
                <div style={{ width: SIZE, height: SIZE }} />
            </Button>
        );
    }

    const isDark = theme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <Button
            variant="ghost"
            onClick={toggleTheme}
            style={{
                height: `${SIZE}px`,
                width: `${SIZE}px`,
                position: "relative",
            }}
        >
            <Image
                src={CuteSun}
                alt="Light mode"
                width={SIZE}
                height={SIZE}
                style={{
                    position: "absolute",
                    inset: 0,
                    height: `${SIZE}px`,
                    width: `${SIZE}px`,
                    opacity: isDark ? 0 : 1,
                    transition: "opacity 300ms",
                }}
            />
            <Image
                src={CuteMoon}
                alt="Dark mode"
                width={SIZE}
                height={SIZE}
                style={{
                    position: "absolute",
                    inset: 0,
                    height: `${SIZE}px`,
                    width: `${SIZE}px`,
                    opacity: isDark ? 1 : 0,
                    transition: "opacity 300ms",
                }}
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
