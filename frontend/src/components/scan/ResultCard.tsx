import {
  CheckCircle2,
  AlertTriangle,
  Leaf,
  MapPin,
  FileText,
  Package,
  Wine,
  Cylinder,
  Cpu,
  Plus,
  Shirt,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ClassifyResult } from '../../api/classifyApi';
import type { GuidanceResult } from '../../api/guidanceApi';

interface ResultCardProps {
  classify: ClassifyResult;
  guidance: GuidanceResult;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Paper: FileText,
  Plastic: Package,
  Glass: Wine,
  Metal: Cylinder,
  'Food/Organic': Leaf,
  'E-Waste': Cpu,
  Medical: Plus,
  Hazardous: AlertTriangle,
  Textile: Shirt,
  General: Trash2,
};

const CATEGORY_COLORS: Record<string, string> = {
  Paper: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  Plastic: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  Glass: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400',
  Metal: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  'Food/Organic': 'bg-eco-green-50 dark:bg-eco-green-900/20 text-eco-green-700 dark:text-eco-green-400',
  'E-Waste': 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  Medical: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  Hazardous: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  Textile: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400',
  General: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

export function ResultCard({ classify, guidance }: ResultCardProps) {
  const Icon = CATEGORY_ICONS[classify.category] ?? Trash2;
  const colorClass = CATEGORY_COLORS[classify.category] ?? CATEGORY_COLORS['General'];
  const confidencePct = Math.round(classify.confidence * 100);

  return (
    <div className="space-y-5">
      {/* Category header */}
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{classify.category}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {classify.sub_category.replace(/_/g, ' ')}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {guidance.recyclable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-eco-green-100 dark:bg-eco-green-900/30 text-eco-green-700 dark:text-eco-green-400">
                <CheckCircle2 className="w-3 h-3" /> Recyclable
              </span>
            )}
            {guidance.hazardous && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-3 h-3" /> Hazardous
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confidence */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-200">Confidence</span>
          <span className="font-bold text-eco-green-600 dark:text-eco-green-400">{confidencePct}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={confidencePct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confidence: ${confidencePct}%`}
          className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
        >
          <div
            className="h-2 bg-eco-green-500 rounded-full transition-all duration-700"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Carbon impact */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-eco-green-50 dark:bg-eco-green-900/20 border border-eco-green-200 dark:border-eco-green-800">
        <Leaf className="w-5 h-5 text-eco-green-600 dark:text-eco-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-eco-green-800 dark:text-eco-green-300">
            ~{classify.carbon_kg.toFixed(1)} kg CO₂e saved
          </p>
          <p className="text-xs text-eco-green-600 dark:text-eco-green-500 mt-0.5">
            by recycling instead of landfilling
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
            {classify.carbon_source_citation}
          </p>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
            AI Guidance
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
          {guidance.explanation}
        </p>
      </div>

      {/* Facility type */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <MapPin className="w-4 h-4 text-eco-teal-600 dark:text-eco-teal-400 flex-shrink-0" />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Take to:</span> {guidance.facility_type}
        </span>
      </div>

      {/* Disposal steps */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Disposal Steps</h3>
        <ol className="space-y-2">
          {guidance.disposal_steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-eco-green-100 dark:bg-eco-green-900/30 text-eco-green-700 dark:text-eco-green-400 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Sustainability tips */}
      <div className="p-4 rounded-2xl bg-eco-teal-50 dark:bg-eco-teal-900/10 border border-eco-teal-100 dark:border-eco-teal-800">
        <h3 className="font-semibold text-eco-teal-800 dark:text-eco-teal-300 mb-3">Sustainability Tips</h3>
        <ul className="space-y-2">
          {guidance.sustainability_tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <Leaf className="w-4 h-4 text-eco-teal-500 dark:text-eco-teal-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-eco-teal-700 dark:text-eco-teal-300">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
