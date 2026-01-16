'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Activity, History, Settings } from 'lucide-react';
import { initDB } from '@/lib/db';
import { NavBar } from '@/components/NavBar';

export default function Home() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        initDB().then(() => setIsReady(true));
    }, []);

    if (!isReady) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="pb-20 min-h-screen bg-gray-50">
            <header className="bg-white p-4 shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">Martial Arts Tracker</h1>
            </header>

            <div className="p-4 space-y-6">
                <Link
                    href="/add"
                    className="flex flex-col items-center justify-center w-full h-48 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-colors active:scale-95"
                >
                    <PlusCircle size={48} className="mb-2" />
                    <span className="text-2xl font-bold">New Session</span>
                </Link>

                <div className="grid grid-cols-2 gap-4">
                    <Link href="/history" className="flex flex-col items-center justify-center h-32 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <History size={32} className="text-purple-500 mb-2" />
                        <span className="font-medium text-gray-700">History</span>
                    </Link>
                    <Link href="/stats" className="flex flex-col items-center justify-center h-32 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Activity size={32} className="text-green-500 mb-2" />
                        <span className="font-medium text-gray-700">Stats</span>
                    </Link>
                    <Link href="/settings" className="flex flex-col items-center justify-center h-32 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow col-span-2">
                        <Settings size={32} className="text-gray-500 mb-2" />
                        <span className="font-medium text-gray-700">Manage Arts & Data</span>
                    </Link>
                </div>
            </div>

            <NavBar />
        </main>
    );
}
