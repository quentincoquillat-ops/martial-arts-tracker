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
        <main className="pb-24 min-h-screen bg-gray-50">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <h1 className="text-xl font-bold mb-4">Performance Stats</h1>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {arts.map(art => (
                        <button
                            key={art.id}
                            onClick={() => setSelectedArtId(art.id)}
                            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedArtId === art.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            {art.name}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-4 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">ℹ️</span>
                    <p className="text-sm text-blue-800">
                        Averages are calculated from the last 5 sessions only.
                    </p>
                </div>

                {stats.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No data available for this art.</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {stats.map((stat, i) => (
                            <div key={stat.criterionId} className={`flex items-center justify-between p-4 border-b last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <span className="font-medium text-gray-800">{stat.criterionName}</span>
                                <div className={cn("px-3 py-1 rounded-full font-bold min-w-[3rem] text-center", getColorForAvg(stat.average))}>
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
