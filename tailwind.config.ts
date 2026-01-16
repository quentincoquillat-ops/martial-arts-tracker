import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'rating-0': '#8B0000', // Dark Red
                'rating-1': '#FF0000', // Red
                'rating-2': '#FFA500', // Orange
                'rating-3': '#FFFF00', // Yellow
                'rating-4': '#90EE90', // Light Green
                'rating-5': '#006400', // Dark Green
                // Martial Arts Theme
                'ma-red': '#8B0000', // Dark Red
                'ma-gold': '#D4AF37', // Gold
                'ma-black': '#1a1a1a', // Ink Black
                'ma-paper': '#f4f1ea', // Rice Paper
                'ma-frame': '#4A3C31', // Dark Wood
                'ma-accent': '#C41E3A', // Vermilion
            },
        },
    },
    plugins: [],
};
export default config;
