import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});
const fredoka = localFont({
    src: "./fonts/Fredoka-VariableFont_wdth,wght.ttf",
    variable: "--font-fredoka", // This is optional, but allows for CSS custom properties
    weight: "100 900", // Define the weight range (for variable fonts)
});

const quicksand = localFont({
    src: "./fonts/Quicksand-VariableFont_wght.ttf",
    variable: "--font-quicksand", // Optional variable name
    weight: "300 700", // Define the weight range (for variable fonts)
});

export const metadata: Metadata = {
    title: "Reparper - Fill out your Younghoon reports easily",
    description:
        "Easily fill out Younghoon report cards using the provided Google Sheets template.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // Add suppressHydrationWarning here
        <html
            lang="en"
            suppressHydrationWarning
        >
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${quicksand.variable} antialiased bg-background`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Header />
                    <main className="p-4">{children}</main>
                    <Toaster />
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}
