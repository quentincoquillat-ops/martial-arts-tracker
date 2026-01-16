'use client';

import { useEffect, useState } from 'react';
import { getSessions, getActiveArts } from '@/lib/db';
import { Session } from '@/types';
import { NavBar } from '@/components/NavBar';
import { formatDateEgypt } from '@/lib/utils';

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

function getRatingColor(val: number) {
    const map = [
        'bg-rating-0', 'bg-rating-1', 'bg-rating-2',
        'bg-rating-3', 'bg-rating-4', 'bg-rating-5'
    ];
    return map[val] || 'bg-gray-500';
}

export default function HistoryPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [arts, setArts] = useState<Record<string, string>>({}); // id -> name
    const [filterArt, setFilterArt] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getSessions(),
            getActiveArts()
        ]).then(([sData, aData]) => {
            setSessions(sData);
            const artMap: Record<string, string> = {};
            aData.forEach(a => artMap[a.id] = a.name);
            setArts(artMap);
            setLoading(false);
        });
    }, []);

    const filtered = filterArt === 'all'
        ? sessions
        : sessions.filter(s => s.artId === filterArt);

    return (
        <main className="pb-24 min-h-screen bg-transparent">
            <header className="bg-ma-paper p-4 shadow-sm sticky top-0 z-10 border-b border-ma-frame/20">
                <h1 className="text-xl font-bold mb-4 font-serif text-ma-frame">History</h1>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setFilterArt('all')}
                        className={`px-4 py-1.5 rounded-sm text-sm whitespace-nowrap font-serif transition-colors border ${filterArt === 'all' ? 'bg-ma-accent text-white border-ma-accent' : 'bg-transparent text-ma-frame border-ma-frame hover:bg-ma-frame/5'
                            }`}
                    >
                        All
                    </button>
                    {Object.keys(arts).map(id => (
                        <button
                            key={id}
                            onClick={() => setFilterArt(id)}
                            className={`px-4 py-1.5 rounded-sm text-sm whitespace-nowrap font-serif transition-colors border ${filterArt === id ? 'bg-ma-accent text-white border-ma-accent' : 'bg-transparent text-ma-frame border-ma-frame hover:bg-ma-frame/5'
                                }`}
                        >
                            {arts[id]}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-ma-frame/50 font-serif italic">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-10 text-ma-frame/50 font-serif italic">No sessions found.</div>
                ) : (
                    filtered.map(session => (
                        <div key={session.id} className="bg-ma-paper rounded-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2)] p-6 border-2 border-ma-frame relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-ma-frame opacity-50"></div>
                            <div className="flex justify-between items-start mb-4 border-b border-gray-300 pb-2">
                                <div>
                                    <span className="text-xs font-bold uppercase text-ma-accent tracking-wide font-serif">
                                        {arts[session.artId] || session.artId}
                                    </span>
                                    <h3 className="text-lg font-bold text-ma-frame font-serif mt-1">
                                        {formatDateEgypt(session.dateISO)}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {session.ratings.map((r, i) => (
                                    <div key={i} className={`text-xs px-2 py-1 rounded-sm text-white font-bold flex items-center gap-1 shadow-sm border border-black/10 ${getRatingColor(r.value)}`}>
                                        <span className={r.value === 3 || r.value === 4 ? "text-ma-black" : "text-white"}>
                                            {r.criterionNameAtTime}: {r.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {session.notesText && (
                                <p className="text-ma-black/80 text-sm bg-ma-frame/5 p-3 rounded-sm italic font-serif border-l-2 border-ma-frame/30">
                                    "{session.notesText}"
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
            <NavBar />
        </main>
    );
}
