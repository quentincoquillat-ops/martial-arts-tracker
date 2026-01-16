import { RatingValue } from "@/types";
import { cn } from "@/lib/utils";

interface RatingControlProps {
    value: RatingValue | undefined;
    onChange: (val: RatingValue) => void;
    disabled?: boolean;
}

export function RatingControl({ value, onChange, disabled }: RatingControlProps) {
    const options: { val: RatingValue; label: string; colorClass: string; textClass: string }[] = [
        { val: 0, label: "0", colorClass: "bg-rating-0", textClass: "text-white" },
        { val: 1, label: "1", colorClass: "bg-rating-1", textClass: "text-white" },
        { val: 2, label: "2", colorClass: "bg-rating-2", textClass: "text-white" },
        { val: 3, label: "3", colorClass: "bg-rating-3", textClass: "text-black" }, // Yellow needs dark text
        { val: 4, label: "4", colorClass: "bg-rating-4", textClass: "text-black" }, // Light green might need dark text
        { val: 5, label: "5", colorClass: "bg-rating-5", textClass: "text-white" },
    ];

    return (
        <div className="flex justify-between gap-1 w-full max-w-sm">
            {options.map((opt) => {
                const isSelected = value === opt.val;
                return (
                    <button
                        key={opt.val}
                        onClick={() => onChange(opt.val)}
                        disabled={disabled}
                        type="button"
                        className={cn(
                            "flex-1 aspect-square rounded-md flex items-center justify-center font-bold text-lg transition-transform active:scale-95 touch-target",
                            isSelected ? cn(opt.colorClass, opt.textClass, "ring-4 ring-offset-2 ring-blue-400 scale-105") : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        )}
                        aria-label={`Rate ${opt.val}`}
                        aria-pressed={isSelected}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
