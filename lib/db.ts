import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MartialArt, Criterion, Session } from '@/types';

interface MartialArtsDB extends DBSchema {
    martial_arts: {
        key: string;
        value: MartialArt;
    };
    criteria: {
        key: string;
        value: Criterion;
        indexes: { 'by-art': string };
    };
    sessions: {
        key: number;
        value: Session;
        indexes: { 'by-art': string; 'by-date': string };
    };
}

const DB_NAME = 'martial-arts-tracker-db';
const DB_VERSION = 1;

const DEFAULT_ARTS = [
    { id: 'qigong', name: 'Qi Gong' },
    { id: 'taijiquan', name: 'Tai Ji Quan' },
    { id: 'wingtsun', name: 'Wing Tsun' },
    { id: 'chaiya', name: 'Chaiya' },
    { id: 'eskrima', name: 'Eskrima' },
    { id: 'shaolin', name: 'Shaolin' },
    { id: 'powertraining', name: 'Power Training' },
];

const DEFAULT_CRITERIA: { artId: string; names: string[] }[] = [
    { artId: 'qigong', names: ['Bae Hue', 'Ming Men', 'Respiration', 'Yi'] },
    { artId: 'taijiquan', names: ['Bae Hue', 'Ming Men', 'Connection', 'Jing and not Li', 'Sens of opponent'] },
    { artId: 'wingtsun', names: ['Bridge the Gap', 'Moove first', 'Footwork', 'Keep connection', 'Sens of opponent'] },
    { artId: 'chaiya', names: ['Footwork', 'Sens of opponent', 'toes up', 'connection elbows and knees'] },
    { artId: 'eskrima', names: ['Footwork', 'gard on the shoulder', 'grasp the stick'] },
    { artId: 'shaolin', names: ['Bae Hue', 'Ming Men', 'Eslasticity', 'Continuity', 'Yi', 'Grounding'] },
    { artId: 'powertraining', names: ['Effort', 'Breathing', 'Connection', 'Elasticity', 'Focus'] },
];

let dbPromise: Promise<IDBPDatabase<MartialArtsDB>>;

export function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<MartialArtsDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Create stores
                if (!db.objectStoreNames.contains('martial_arts')) {
                    db.createObjectStore('martial_arts', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('criteria')) {
                    const store = db.createObjectStore('criteria', { keyPath: 'id' });
                    store.createIndex('by-art', 'artId');
                }
                if (!db.objectStoreNames.contains('sessions')) {
                    const store = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('by-art', 'artId');
                    store.createIndex('by-date', 'dateISO');
                }
            },
        });
    }
    return dbPromise;
}

export async function initDB() {
    const db = await getDB();
    const tx = db.transaction(['martial_arts', 'criteria'], 'readwrite');
    const artsStore = tx.objectStore('martial_arts');
    const criteriaStore = tx.objectStore('criteria');

    const count = await artsStore.count();
    if (count === 0) {
        console.log('Seeding Database...');
        // Seed Arts
        for (const art of DEFAULT_ARTS) {
            await artsStore.put({ ...art, active: true });
        }

        // Seed Criteria
        for (const group of DEFAULT_CRITERIA) {
            group.names.forEach((name, index) => {
                criteriaStore.put({
                    id: `${group.artId}-${index}`, // Simple ID generation
                    artId: group.artId,
                    name,
                    order: index,
                    active: true,
                });
            });
        }
    }
    await tx.done;
}

// Data Access
export async function getActiveArts() {
    const db = await getDB();
    return db.getAll('martial_arts');
}

export async function getArtCriteria(artId: string) {
    const db = await getDB();
    const allCriteria = await db.getAllFromIndex('criteria', 'by-art', artId);
    return allCriteria.filter(c => c.active && !c.deletedAt).sort((a, b) => a.order - b.order);
}

// For editing, we might need all including deleted? Or just active logic.
// The prompt says "soft delete", so historical sessions remain readable.
// But valid criteria for NEW sessions should be filtered.
export async function getAllArtCriteria(artId: string) {
    const db = await getDB();
    const allCriteria = await db.getAllFromIndex('criteria', 'by-art', artId);
    return allCriteria.sort((a, b) => a.order - b.order);
}

export async function addSession(session: Omit<Session, 'id'>) {
    const db = await getDB();
    return db.add('sessions', session as Session);
}

export async function getSessions(limit?: number) {
    const db = await getDB();
    // Getting all and sorting in JS is okay for local MVP, or use index cursor
    const sessions = await db.getAll('sessions');
    // Sort desc by date
    sessions.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    if (limit) return sessions.slice(0, limit);
    return sessions;
}

export async function getStats(artId: string) {
    const db = await getDB();
    // Get last 5 sessions for this art
    const allSessions = await db.getAllFromIndex('sessions', 'by-art', artId);
    const recent = allSessions
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
        .slice(0, 5);

    if (recent.length === 0) return null;

    // Calculate averages
    // Map of criterionName -> sum / count
    // Wait, the prompt says "per criterion".
    // But criterion names can change? Prompt: "store ratings as [{criterionId, criterionNameAtTime, value}]"
    // And "old sessions display exactly as recorded".
    // Stats: "Last 5 sessions averages per criterion".
    // Assume we track by criterionID.

    const totals: Record<string, { sum: number; count: number }> = {};

    recent.forEach(session => {
        session.ratings.forEach(r => {
            if (!totals[r.criterionId]) totals[r.criterionId] = { sum: 0, count: 0 };
            totals[r.criterionId].sum += r.value;
            totals[r.criterionId].count += 1;
        });
    });

    // We also need the CURRENT name for display? Or the name at time? 
    // Usually logic implies checking current criteria list to show stats for *current* criteria.
    // If a criterion was deleted, should it show in stats?
    // "User can ... remove criteria ... soft delete so historical sessions remain readable"
    // Prob show stats for currently active criteria mainly? Or all?
    // Let's stick to currently active criteria for the stats dashboard to keep it clean.

    const activeCriteria = await getArtCriteria(artId);

    const stats = activeCriteria.map(c => {
        const t = totals[c.id];
        return {
            criterionId: c.id,
            criterionName: c.name,
            average: t ? t.sum / t.count : 0,
            hasData: !!t
        };
    }).filter(s => s.hasData); // Only show if data exists? Or show 0? 
    // Showing 0 is confusing. Let's return all active, with 0 if no data.

    return activeCriteria.map(c => {
        const t = totals[c.id];
        return {
            criterionId: c.id,
            criterionName: c.name,
            average: t ? Number((t.sum / t.count).toFixed(1)) : 0
        };
    });
}

export async function exportData() {
    const db = await getDB();
    const sessions = await db.getAll('sessions');
    const martial_arts = await db.getAll('martial_arts');
    const criteria = await db.getAll('criteria');
    return JSON.stringify({ sessions, martial_arts, criteria });
}

export async function importData(json: string) {
    const data = JSON.parse(json);
    const db = await getDB();
    const tx = db.transaction(['sessions', 'martial_arts', 'criteria'], 'readwrite');

    // Clear existing? Or merge? Usually "Restore from Backup" means replace or overwrite.
    // Safety: clear all first.
    await tx.objectStore('sessions').clear();
    await tx.objectStore('martial_arts').clear();
    await tx.objectStore('criteria').clear();

    for (const s of data.sessions) await tx.objectStore('sessions').put(s);
    for (const m of data.martial_arts) await tx.objectStore('martial_arts').put(m);
    for (const c of data.criteria) await tx.objectStore('criteria').put(c);

    await tx.done;
}

export async function updateCriterion(criterion: Criterion) {
    const db = await getDB();
    return db.put('criteria', criterion);
}

export async function deleteCriterion(id: string) {
    const db = await getDB();
    const c = await db.get('criteria', id);
    if (c) {
        c.deletedAt = new Date().toISOString();
        c.active = false;
        await db.put('criteria', c);
    }
}
