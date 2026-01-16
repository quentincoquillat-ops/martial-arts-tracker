'use client';

import { useEffect, useState } from 'react';
import { getActiveArts, exportData, importData, getAllArtCriteria, updateCriterion, deleteCriterion, getSessions } from '@/lib/db';
import { NavBar } from '@/components/NavBar';
import { Download, Upload, Edit, Trash2, ArrowUp, ArrowDown, Plus, FileText } from 'lucide-react';
import { Criterion } from '@/types';

export default function SettingsPage() {
    const [mode, setMode] = useState<'menu' | 'criteria'>('menu');
    const [arts, setArts] = useState<{ id: string, name: string }[]>([]);
    const [selectedArtId, setSelectedArtId] = useState<string>('');
    const [currentCriteria, setCurrentCriteria] = useState<Criterion[]>([]);

    useEffect(() => {
        getActiveArts().then(setArts);
    }, []);

    const handleExport = async () => {
        const json = await exportData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `martial-arts-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleExportCSV = async () => {
        const sessions = await getSessions();
        const allArts = await getActiveArts();
        const artMap = Object.fromEntries(allArts.map(a => [a.id, a.name]));

        // Header: sessionDate, martialArt, criterionNameAtTime, rating
        let csv = 'sessionDate,martialArt,criterionNameAtTime,rating\n';

        sessions.forEach(s => {
            const artName = artMap[s.artId] || s.artId;
            const dateStr = s.dateISO; // Keep ISO or format? Prompt says "sessionDate". ISO is safest.
            s.ratings.forEach(r => {
                // Escape quotes in name if needed
                const safeName = r.criterionNameAtTime.includes(',') ? `"${r.criterionNameAtTime}"` : r.criterionNameAtTime;
                csv += `${dateStr},${artName},${safeName},${r.value}\n`;
            });
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coach-pack-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = e.target?.result as string;
                await importData(json);
                alert('Data restored successfully!');
            } catch (err) {
                alert('Failed to import data: ' + err);
            }
        };
        reader.readAsText(file);
    };

    const loadCriteria = async (artId: string) => {
        setSelectedArtId(artId);
        const data = await getAllArtCriteria(artId);
        setCurrentCriteria(data.filter(c => !c.deletedAt));
        setMode('criteria');
    };

    useEffect(() => {
        if (mode === 'criteria' && selectedArtId) {
            getAllArtCriteria(selectedArtId).then(list => {
                setCurrentCriteria(list.filter(c => !c.deletedAt));
            });
        }
    }, [mode, selectedArtId]);

    const handleUpdate = async (c: Criterion) => {
        await updateCriterion(c); // Not used in UI yet? Ah, we use handleRename
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this criterion? Historical data will be preserved.')) return;
        await deleteCriterion(id);
        const list = await getAllArtCriteria(selectedArtId);
        setCurrentCriteria(list.filter(x => !x.deletedAt));
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === currentCriteria.length - 1)) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        const c1 = currentCriteria[index];
        const c2 = currentCriteria[targetIndex];

        const order1 = c1.order;
        const order2 = c2.order;

        await updateCriterion({ ...c1, order: order2 });
        await updateCriterion({ ...c2, order: order1 });

        const list = await getAllArtCriteria(selectedArtId);
        setCurrentCriteria(list.filter(x => !x.deletedAt));
    };

    const handleAdd = async () => {
        const name = prompt('New Criterion Name:');
        if (!name) return;
        const newOrder = currentCriteria.length > 0 ? Math.max(...currentCriteria.map(c => c.order)) + 1 : 0;
        await updateCriterion({
            id: `${selectedArtId}-${Date.now()}`,
            artId: selectedArtId,
            name,
            order: newOrder,
            active: true
        });
        const list = await getAllArtCriteria(selectedArtId);
        setCurrentCriteria(list.filter(x => !x.deletedAt));
    };

    const handleRename = async (c: Criterion) => {
        const name = prompt('Rename Criterion:', c.name);
        if (!name || name === c.name) return;
        await updateCriterion({ ...c, name });
        const list = await getAllArtCriteria(selectedArtId);
        setCurrentCriteria(list.filter(x => !x.deletedAt));
    };

    return (
        <main className="pb-24 min-h-screen bg-gray-50">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center">
                {mode === 'criteria' && (
                    <button onClick={() => setMode('menu')} className="mr-4 text-blue-600 font-bold">Back</button>
                )}
                <h1 className="text-xl font-bold">{mode === 'menu' ? 'Settings' : `Editing: ${arts.find(a => a.id === selectedArtId)?.name}`}</h1>
            </header>

            <div className="p-4 space-y-6">

                {mode === 'menu' ? (
                    <>
                        <section className="bg-white rounded-xl shadow-sm p-4">
                            <h2 className="font-bold text-gray-900 mb-4">Data Management</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={handleExport} className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg text-blue-700 hover:bg-gray-200">
                                    <Download className="mb-2" />
                                    <span>Backup (JSON)</span>
                                </button>
                                <button onClick={() => document.getElementById('chk-file')?.click()} className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg text-blue-700 hover:bg-gray-200">
                                    <Upload className="mb-2" />
                                    <span>Restore (JSON)</span>
                                </button>
                                <input id="chk-file" type="file" className="hidden" accept=".json" onChange={handleImport} />

                                <button onClick={handleExportCSV} className="flex flex-col items-center justify-center p-4 bg-blue-100 rounded-lg text-blue-800 hover:bg-blue-200 col-span-2">
                                    <FileText className="mb-2" />
                                    <span>Export Coach Pack (CSV)</span>
                                </button>
                            </div>
                        </section>

                        <section className="bg-white rounded-xl shadow-sm p-4">
                            <h2 className="font-bold text-gray-900 mb-4">Manage Criteria</h2>
                            <div className="space-y-2">
                                {arts.map(art => (
                                    <button
                                        key={art.id}
                                        onClick={() => loadCriteria(art.id)}
                                        className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 flex justify-between items-center"
                                    >
                                        <span>{art.name}</span>
                                        <Edit size={16} className="text-gray-400" />
                                    </button>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            {currentCriteria.map((c, i) => (
                                <div key={c.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-2">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleMove(i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-20"><ArrowUp size={16} /></button>
                                        <button onClick={() => handleMove(i, 'down')} disabled={i === currentCriteria.length - 1} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-20"><ArrowDown size={16} /></button>
                                    </div>
                                    <div className="flex-1 font-medium">{c.name}</div>
                                    <button onClick={() => handleRename(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAdd}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500"
                        >
                            <Plus /> Add Criterion
                        </button>
                    </>
                )}
            </div>
            <NavBar />
        </main>
    );
}
