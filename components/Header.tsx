import Image from 'next/image';

export function Header() {
    return (
        <header className="flex justify-center items-center py-6 bg-ma-paper border-b-4 border-ma-frame shadow-sm">
            <div className="relative w-32 h-32 drop-shadow-md">
                <Image
                    src="/meshkah_logo.png"
                    alt="School Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </header>
    );
}
