import { CheckCircle2, XCircle, MapPin, AlertTriangle, Recycle } from 'lucide-react';
import type { WasteCategory } from '../../data/learnContent';

interface Props {
  category: WasteCategory;
}

const CATEGORY_BG: Record<string, string> = {
  'Paper':        'border-yellow-200 dark:border-yellow-800',
  'Plastic':      'border-blue-200 dark:border-blue-800',
  'Glass':        'border-cyan-200 dark:border-cyan-800',
  'Metal':        'border-gray-200 dark:border-gray-600',
  'Food/Organic': 'border-eco-green-200 dark:border-eco-green-800',
  'E-Waste':      'border-purple-200 dark:border-purple-800',
  'Medical':      'border-red-200 dark:border-red-800',
  'Hazardous':    'border-orange-200 dark:border-orange-800',
  'Textile':      'border-pink-200 dark:border-pink-800',
  'General':      'border-gray-200 dark:border-gray-600',
};

export function WasteCategoryCard({ category }: Props) {
  const borderColor = CATEGORY_BG[category.name] ?? CATEGORY_BG['General'];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border-2 ${borderColor} p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">{category.emoji}</span>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
          <div className="flex gap-2 mt-0.5">
            {category.recyclable && (
              <span className="inline-flex items-center gap-1 text-xs text-eco-green-600 dark:text-eco-green-400 font-medium">
                <Recycle className="w-3 h-3" /> Recyclable
              </span>
            )}
            {category.hazardous && (
              <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                <AlertTriangle className="w-3 h-3" /> Hazardous
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{category.description}</p>

      {/* Do / Don't */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-eco-green-700 dark:text-eco-green-400 uppercase tracking-wide mb-1.5">✓ Do</p>
          <ul className="space-y-1">
            {category.dos.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-eco-green-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1.5">✗ Don't</p>
          <ul className="space-y-1">
            {category.donts.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Facility */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
        <MapPin className="w-3.5 h-3.5 text-eco-teal-500 flex-shrink-0" />
        <span className="text-xs text-gray-500 dark:text-gray-400">{category.facilityType}</span>
      </div>
    </div>
  );
}
