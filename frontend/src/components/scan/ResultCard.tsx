import { useEffect, useState } from 'react';
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
  Copy,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
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
  Paper: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  Plastic: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  Glass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  Metal: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  'Food/Organic': 'bg-eco-green-50 dark:bg-eco-green-900/30 text-eco-green-700 dark:text-eco-green-400 border-eco-green-200 dark:border-eco-green-800',
  'E-Waste': 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  Medical: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  Hazardous: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  Textile: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800',
  General: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

// Municipal sorting bin color guides
const BIN_RECOMMENDATIONS: Record<string, { name: string; color: string; badgeBg: string; text: string }> = {
  Paper: { name: 'Blue Bin (Paper & Cardboard)', color: '#2563eb', badgeBg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300' },
  Plastic: { name: 'Yellow Bin (Plastics & Packaging)', color: '#eab308', badgeBg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300' },
  Glass: { name: 'Green Bin (Glass Bottles & Jars)', color: '#16a34a', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300' },
  Metal: { name: 'Yellow Bin (Metals & Beverage Cans)', color: '#ca8a04', badgeBg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300' },
  'Food/Organic': { name: 'Brown / Green Bin (Compost & Organics)', color: '#854d0e', badgeBg: 'bg-lime-100 dark:bg-lime-900/40', text: 'text-lime-800 dark:text-lime-300' },
  'E-Waste': { name: 'Special Collection / E-Waste Drop-Off Center', color: '#9333ea', badgeBg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-800 dark:text-purple-300' },
  Medical: { name: 'Hazardous / Pharmacy Return Point', color: '#dc2626', badgeBg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-300' },
  Hazardous: { name: 'Special Chemical Drop-Off Facility', color: '#ea580c', badgeBg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-300' },
  Textile: { name: 'Textile Bank / Clothing Donation Bin', color: '#db2777', badgeBg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-800 dark:text-pink-300' },
  General: { name: 'Black / Grey Bin (Landfill Residual)', color: '#4b5563', badgeBg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300' },
};

function playCompletionChime() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
    osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch {}
}

export function ResultCard({ classify, guidance }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const Icon = CATEGORY_ICONS[classify.category] ?? Trash2;
  const colorClass = CATEGORY_COLORS[classify.category] ?? CATEGORY_COLORS['General'];
  const confidencePct = Math.round(classify.confidence * 100);
  const binInfo = BIN_RECOMMENDATIONS[classify.category] ?? BIN_RECOMMENDATIONS['General'];

  // Play subtle celebratory chime once on load
  useEffect(() => {
    playCompletionChime();
  }, []);

  const handleCopy = () => {
    const text = `EcoSort AI Classification:\nItem: ${classify.category} (${classify.sub_category})\nRecyclable: ${guidance.recyclable ? 'Yes' : 'No'}\nDestination: ${binInfo.name}\nCarbon Saved: ~${classify.carbon_kg} kg CO2e\nSteps:\n${guidance.disposal_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Disposal guidance copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Category header card */}
      <div className="flex items-start gap-4 p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{classify.category}</h2>
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy details"
            >
              {copied ? <Check className="w-4 h-4 text-eco-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize mt-0.5">
            Material: {classify.sub_category.replace(/_/g, ' ')}
          </p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {guidance.recyclable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-eco-green-100 dark:bg-eco-green-900/30 text-eco-green-700 dark:text-eco-green-400 border border-eco-green-200 dark:border-eco-green-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recyclable Material
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Non-Recyclable (Residual)
              </span>
            )}
            {guidance.hazardous && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-3.5 h-3.5" /> Requires Special Handling
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Bin Banner */}
      <div className={`p-4 rounded-2xl border flex items-center gap-3 ${binInfo.badgeBg} border-current/20`}>
        <div className="w-3 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: binInfo.color }} />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider opacity-75">Target Sorting Bin</p>
          <p className={`text-base font-bold ${binInfo.text}`}>{binInfo.name}</p>
        </div>
      </div>

      {/* Confidence & Carbon Saved Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Confidence Gauge */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span>Model Confidence</span>
            <span className="text-eco-green-600 dark:text-eco-green-400 font-bold">{confidencePct}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-eco-green-400 to-eco-green-600 rounded-full transition-all duration-700"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            EfficientNetB0 Deep Learning Vision
          </p>
        </div>

        {/* Carbon Impact */}
        <div className="p-4 rounded-2xl bg-eco-green-50/70 dark:bg-eco-green-950/20 border border-eco-green-200/80 dark:border-eco-green-900/50 shadow-sm flex items-start gap-3">
          <Leaf className="w-5 h-5 text-eco-green-600 dark:text-eco-green-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-eco-green-900 dark:text-eco-green-200">
              ~{classify.carbon_kg.toFixed(2)} kg CO₂e Saved
            </p>
            <p className="text-xs text-eco-green-700 dark:text-eco-green-400 mt-0.5">
              Landfill avoidance LCA metric
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 truncate">
              {classify.carbon_source_citation}
            </p>
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm space-y-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
            Gemini AI Eco Intelligence
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
          "{guidance.explanation}"
        </p>
      </div>

      {/* Facility drop-off */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
        <MapPin className="w-5 h-5 text-eco-teal-600 dark:text-eco-teal-400 flex-shrink-0" />
        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-white">Facility:</span> {guidance.facility_type}
        </div>
      </div>

      {/* Step by Step Disposal */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Step-by-Step Disposal Action</h3>
        <ol className="space-y-2.5">
          {guidance.disposal_steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-eco-green-100 dark:bg-eco-green-900/40 text-eco-green-700 dark:text-eco-green-400 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Sustainability Tips */}
      {guidance.sustainability_tips && guidance.sustainability_tips.length > 0 && (
        <div className="p-5 rounded-2xl bg-eco-teal-50/60 dark:bg-eco-teal-950/20 border border-eco-teal-100 dark:border-eco-teal-900/40 shadow-sm space-y-2.5">
          <h3 className="font-bold text-eco-teal-900 dark:text-eco-teal-200 text-sm">Circular Economy Tips</h3>
          <ul className="space-y-2">
            {guidance.sustainability_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Leaf className="w-4 h-4 text-eco-teal-600 dark:text-eco-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-eco-teal-800 dark:text-eco-teal-300">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
