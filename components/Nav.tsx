"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // Import Menu and X icons
import { LucideIcon } from "lucide-react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export type NavItem = {
    name: string;
    href: string;
    icon?: LucideIcon | IconProp;
    img?: string;
};

const navItems: NavItem[] = [
    // {
    //     name: "Students",
    //     href: "/learn",
    //     img: "/sprouty-student.png",
    // },
];

export default function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    return (
        <nav className="flex items-center justify-between">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-1 hover:bg-primary px-3 rounded-lg py-2"
                    >
                        {item.icon ? (
                            typeof item.icon === "function" ? (
                                <item.icon size={20} />
                            ) : (
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    size="lg"
                                />
                            )
                        ) : item.img ? (
                            <Image
                                src={item.img}
                                alt={`${item.name} Mascot`}
                                width={24}
                                height={24}
                            />
                        ) : null}
                        {item.name}
                    </Link>
                ))}
                <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
                <ThemeToggle />
                <button
                    onClick={toggleMenu}
                    type="button"
                    aria-controls="mobile-menu"
                    aria-expanded={isMenuOpen}
                    className="ml-2"
                >
                    <span className="sr-only">Toggle menu</span>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div
                    id="mobile-menu"
                    className="absolute top-full left-0 w-full bg-accent border-t border-foreground shadow-md md:hidden z-50"
                >
                    <div className="flex flex-col p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-1"
                                onClick={() => setIsMenuOpen(false)} // Close menu on link click
                            >
                                {item.icon ? (
                                    typeof item.icon === "function" ? (
                                        <item.icon size={20} />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={item.icon}
                                            size="lg"
                                        />
                                    )
                                ) : item.img ? (
                                    <Image
                                        src={item.img}
                                        alt={`${item.name} Mascot`}
                                        width={24}
                                        height={24}
                                    />
                                ) : null}
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
