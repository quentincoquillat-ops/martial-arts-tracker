export type RatingValue = 0 | 1 | 2 | 3 | 4 | 5;

export interface MartialArt {
    id: string;
    name: string;
    active: boolean;
}

export interface Criterion {
    id: string;
    artId: string;
    name: string;
    order: number;
    active: boolean;
    deletedAt?: string; // ISO date
}

export interface SessionRating {
    criterionId: string;
    criterionNameAtTime: string;
    value: RatingValue;
}

export interface Session {
    id?: number; // Auto-incremented by IDB
    artId: string;
    dateISO: string;
    ratings: SessionRating[];
    notesText: string;
}

export interface ArtStats {
    artId: string;
    criterionStats: {
        criterionId: string;
        criterionName: string; // Current name
        average: number;
    }[];
}
