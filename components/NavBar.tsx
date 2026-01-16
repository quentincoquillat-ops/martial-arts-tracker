import Link from "next/link";
import { Home, History, BarChart2, Settings } from "lucide-react";

export function NavBar() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#f4f1ea] border-t-4 border-ma-frame pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center h-16">
                <Link href="/" className="flex flex-col items-center p-2 text-ma-frame hover:text-ma-accent active:text-ma-accent transition-colors">
                    <Home size={24} />
                    <span className="text-xs mt-1 font-serif font-bold">Home</span>
                </Link>
                <Link href="/history" className="flex flex-col items-center p-2 text-ma-frame hover:text-ma-accent active:text-ma-accent transition-colors">
                    <History size={24} />
                    <span className="text-xs mt-1 font-serif font-bold">History</span>
                </Link>
                <Link href="/stats" className="flex flex-col items-center p-2 text-ma-frame hover:text-ma-accent active:text-ma-accent transition-colors">
                    <BarChart2 size={24} />
                    <span className="text-xs mt-1 font-serif font-bold">Stats</span>
                </Link>
                <Link href="/settings" className="flex flex-col items-center p-2 text-ma-frame hover:text-ma-accent active:text-ma-accent transition-colors">
                    <Settings size={24} />
                    <span className="text-xs mt-1 font-serif font-bold">Setup</span>
                </Link>
            </div>
        </nav>
    );
}
