'use client';

import { useEffect, useState } from 'react';
import { getActiveArts, getStats } from '@/lib/db';
import { NavBar } from '@/components/NavBar';
import { cn } from '@/lib/utils';

interface StatItem {
    criterionId: string;
    criterionName: string;
    average: number;
}

export default function StatsPage() {
    const [arts, setArts] = useState<{ id: string, name: string }[]>([]);
    const [selectedArtId, setSelectedArtId] = useState<string>('');
    const [stats, setStats] = useState<StatItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActiveArts().then(data => {
            setArts(data);
            if (data.length > 0) setSelectedArtId(data[0].id);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (selectedArtId) {
            getStats(selectedArtId).then(data => {
                setStats(data || []);
            });
        }
    }, [selectedArtId]);

    const getColorForAvg = (avg: number) => {
        const val = Math.round(avg);
        const map = [
            'bg-rating-0 text-white', 'bg-rating-1 text-white', 'bg-rating-2 text-white',
            'bg-rating-3 text-black', 'bg-rating-4 text-black', 'bg-rating-5 text-white'
        ];
        return map[val] || 'bg-gray-500 text-white';
    };

    return (
        <main className="pb-24 min-h-screen bg-transparent">
            <header className="bg-ma-paper p-4 shadow-sm sticky top-0 z-10 border-b border-ma-frame/20">
                <h1 className="text-xl font-bold mb-4 font-serif text-ma-frame">Performance Stats</h1>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {arts.map(art => (
                        <button
                            key={art.id}
                            onClick={() => setSelectedArtId(art.id)}
                            className={`px-4 py-1.5 rounded-sm text-sm whitespace-nowrap font-serif transition-colors border ${selectedArtId === art.id ? 'bg-ma-accent text-white border-ma-accent' : 'bg-transparent text-ma-frame border-ma-frame hover:bg-ma-frame/5'
                                }`}
                        >
                            {art.name}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-4 space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-sm border border-blue-200 flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">ℹ️</span>
                    <p className="text-sm text-blue-800 font-serif">
                        Averages are calculated from the last 5 sessions only.
                    </p>
                </div>

                {stats.length === 0 ? (
                    <div className="text-center py-10 text-ma-frame/50 font-serif italic">No data available for this art.</div>
                ) : (
                    <div className="bg-ma-paper rounded-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2)] border-2 border-ma-frame relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-ma-frame opacity-50"></div>
                        {stats.map((stat, i) => (
                            <div key={stat.criterionId} className={`flex items-center justify-between p-4 border-b border-ma-frame/10 last:border-0 ${i % 2 === 0 ? 'bg-transparent' : 'bg-ma-frame/5'}`}>
                                <span className="font-medium text-ma-frame font-serif">{stat.criterionName}</span>
                                <div className={cn("px-3 py-1 rounded-sm font-bold min-w-[3rem] text-center font-serif shadow-sm border border-black/10", getColorForAvg(stat.average))}>
                                    {stat.average}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <NavBar />
        </main>
    );
}
