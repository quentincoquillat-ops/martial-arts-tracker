'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save } from 'lucide-react';
import { getActiveArts, getArtCriteria, addSession } from '@/lib/db';
import { MartialArt, Criterion, RatingValue } from '@/types';
import { RatingControl } from '@/components/RatingControl';
import { NavBar } from '@/components/NavBar';

export default function AddSessionPage() {
    const router = useRouter();
    const [arts, setArts] = useState<MartialArt[]>([]);
    const [selectedArtId, setSelectedArtId] = useState<string>('');
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [ratings, setRatings] = useState<Record<string, RatingValue>>({});
    const [date, setDate] = useState(new Date().toISOString().substring(0, 16)); // datetime-local format
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getActiveArts().then(data => {
            setArts(data);
            if (data.length > 0) setSelectedArtId(data[0].id); // Default to first
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (selectedArtId) {
            getArtCriteria(selectedArtId).then(data => {
                setCriteria(data);
                setRatings({}); // Reset ratings on art change
            });
        }
    }, [selectedArtId]);

    const handleRatingChange = (criterionId: string, value: RatingValue) => {
        setRatings(prev => ({ ...prev, [criterionId]: value }));
    };

    const isValid = criteria.length > 0 && criteria.every(c => ratings[c.id] !== undefined);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const artName = arts.find(a => a.id === selectedArtId)?.name || 'Unknown';
            await addSession({
                artId: selectedArtId,
                dateISO: new Date(date).toISOString(),
                ratings: criteria.map(c => ({
                    criterionId: c.id,
                    criterionNameAtTime: c.name,
                    value: ratings[c.id]!,
                })),
                notesText: notes,
            });
            router.push('/history');
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <main className="pb-24 min-h-screen bg-gray-50">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-gray-600">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">Log Session</h1>
                <div className="w-6" />
            </header>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">

                {/* Date */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                    <input
                        type="datetime-local"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full text-lg border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
                    />
                </div>

                {/* Art Selection */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Martial Art</label>
                    <div className="flex flex-wrap gap-2">
                        {arts.map(art => (
                            <button
                                key={art.id}
                                type="button"
                                onClick={() => setSelectedArtId(art.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedArtId === art.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {art.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Criteria */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 px-1">Performance Criteria</h2>
                    {criteria.map(c => (
                        <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                            <label className="block font-medium text-gray-900">{c.name}</label>
                            <RatingControl
                                value={ratings[c.id]}
                                onChange={(val) => handleRatingChange(c.id, val)}
                            />
                        </div>
                    ))}
                    {criteria.length === 0 && (
                        <div className="text-gray-500 text-center py-4">No active criteria for this art.</div>
                    )}
                </div>

                {/* Notes */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md h-32 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="How did it feel? What to focus on next?"
                    />
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold text-white shadow-lg transition-all ${isValid ? 'bg-green-600 hover:bg-green-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    <Save size={24} />
                    {isSubmitting ? 'Saving...' : 'Save Session'}
                </button>

            </form>

            <NavBar />
        </main>
    );
}
