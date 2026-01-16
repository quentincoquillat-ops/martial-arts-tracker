import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Martial Arts Tracker",
    description: "Self-assessment for martial arts",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    minimumScale: 1,
    viewportFit: "cover",
    // Note: "shrink-to-fit" n'est pas supporté en objet Viewport Next.
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className + " bg-gray-50 min-h-screen pb-safe"}>
                {children}
            </body>
        </html>
    );
}
