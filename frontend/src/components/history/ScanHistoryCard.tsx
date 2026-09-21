import { useState } from 'react';
import { ChevronDown, ChevronUp, Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ScanRecord } from '../../api/scansApi';

const CATEGORY_COLORS: Record<string, string> = {
  'Paper':        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  'Plastic':      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Glass':        'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  'Metal':        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  'Food/Organic': 'bg-eco-green-100 dark:bg-eco-green-900/30 text-eco-green-700 dark:text-eco-green-400',
  'E-Waste':      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  'Medical':      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  'Hazardous':    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  'Textile':      'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  'General':      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

interface Props {
  scan: ScanRecord;
}

export function ScanHistoryCard({ scan }: Props) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = CATEGORY_COLORS[scan.category] ?? CATEGORY_COLORS['General'];
  const date = new Date(scan.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const time = new Date(scan.created_at).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        aria-expanded={expanded}
      >
        {/* Thumbnail */}
        <img
          src={scan.image_signed_url}
          alt={scan.category}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-700"
          loading="lazy"
        />
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
              {scan.category}
            </span>
            {scan.disposal_guidance.recyclable && (
              <CheckCircle2 className="w-3.5 h-3.5 text-eco-green-500" aria-label="Recyclable" />
            )}
            {scan.disposal_guidance.hazardous && (
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" aria-label="Hazardous" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate capitalize">
            {scan.sub_category.replace(/_/g, ' ')}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400 dark:text-gray-500">{date} · {time}</span>
            <span className="inline-flex items-center gap-1 text-xs text-eco-green-600 dark:text-eco-green-400 font-medium">
              <Leaf className="w-3 h-3" /> {scan.carbon_kg.toFixed(1)} kg CO₂e
            </span>
          </div>
        </div>
        {/* Expand chevron */}
        <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expandable detail drawer */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          {/* AI explanation */}
          <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
            {scan.disposal_guidance.explanation}
          </p>
          {/* Disposal steps */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Disposal Steps
            </h4>
            <ol className="space-y-1.5">
              {scan.disposal_guidance.disposal_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-eco-green-100 dark:bg-eco-green-900/30 text-eco-green-700 dark:text-eco-green-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          {/* Carbon citation */}
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">{scan.carbon_source_citation}</p>
        </div>
      )}
    </div>
  );
}
