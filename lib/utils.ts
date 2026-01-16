import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Egypt Timezone (UTC+2 / UTC+3)
export function formatDateEgypt(date: Date | string) {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Cairo',
        hour12: false
    }).format(d);
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
