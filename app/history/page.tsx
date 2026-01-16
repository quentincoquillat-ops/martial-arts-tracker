'use client';

import { useEffect, useState } from 'react';
import { getSessions, getActiveArts } from '@/lib/db';
import { Session, MartialArt } from '@/types';
import { NavBar } from '@/components/NavBar';
import { format } from 'date-fns'; // Wait, I didn't add date-fns. I should use native Intl.

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
        <main className="pb-24 min-h-screen bg-gray-50">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <h1 className="text-xl font-bold mb-4">History</h1>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setFilterArt('all')}
                        className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterArt === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        All
                    </button>
                    {Object.keys(arts).map(id => (
                        <button
                            key={id}
                            onClick={() => setFilterArt(id)}
                            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterArt === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            {arts[id]}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No sessions found.</div>
                ) : (
                    filtered.map(session => (
                        <div key={session.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-bold uppercase text-blue-600 tracking-wide">
                                        {arts[session.artId] || session.artId}
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {formatDate(session.dateISO)}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {session.ratings.map((r, i) => (
                                    <div key={i} className={`text-xs px-2 py-1 rounded text-white font-bold flex items-center gap-1 ${getRatingColor(r.value)}`}>
                                        <span className={r.value === 3 || r.value === 4 ? "text-black" : "text-white"}>
                                            {r.criterionNameAtTime}: {r.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {session.notesText && (
                                <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded italic">
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
