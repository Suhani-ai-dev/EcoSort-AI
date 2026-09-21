import { CheckCircle2, XCircle } from 'lucide-react';
import { RECYCLING_SYMBOLS } from '../../data/learnContent';

export function RecyclingSymbolGrid() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        Recycling symbols help identify materials and whether they can be recycled. Understanding these codes helps you sort correctly.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RECYCLING_SYMBOLS.map((sym) => (
          <div
            key={sym.code}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex gap-3"
          >
            {/* Code badge */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-eco-green-50 dark:bg-eco-green-900/20 flex items-center justify-center text-sm font-bold text-eco-green-700 dark:text-eco-green-400">
              {sym.code}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{sym.name}</p>
                {sym.recyclable
                  ? <CheckCircle2 className="w-4 h-4 text-eco-green-500 flex-shrink-0" aria-label="Recyclable" />
                  : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" aria-label="Not recyclable" />
                }
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sym.materials}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">{sym.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
