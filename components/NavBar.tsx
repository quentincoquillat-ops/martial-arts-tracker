import Link from "next/link";
import { Home, History, BarChart2, Settings } from "lucide-react";

export function NavBar() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
            <div className="flex justify-around items-center h-16">
                <Link href="/" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
                    <Home size={24} />
                    <span className="text-xs mt-1">Home</span>
                </Link>
                <Link href="/history" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
                    <History size={24} />
                    <span className="text-xs mt-1">History</span>
                </Link>
                <Link href="/stats" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
                    <BarChart2 size={24} />
                    <span className="text-xs mt-1">Stats</span>
                </Link>
                <Link href="/settings" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
                    <Settings size={24} />
                    <span className="text-xs mt-1">Setup</span>
                </Link>
            </div>
        </nav>
    );
}
